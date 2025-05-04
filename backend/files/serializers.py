import six
import logging
import datetime

from django.utils.dateparse import parse_date
from django.core.paginator import InvalidPage

from rest_framework import serializers
from rest_framework.pagination import PageNumberPagination, _positive_int
from rest_framework.exceptions import NotFound

from django.db.models import Q, F
from django.db import transaction

from .models import File, FileUpload
from .utils import calculate_file_hash

logger = logging.getLogger(__name__)

class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = FileUpload
        fields = ['id', 'file', 'original_filename', 'file_type', 'size', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']

class FileSerializer(serializers.ModelSerializer):
    class Meta:
        model = File
        fields = ['id', 'file', 'original_filename', 'file_type', 'size', 'uploaded_at']
        read_only_fields = ['id', 'uploaded_at']
    
    def create(self, validated_data):
        uploaded_file = validated_data['file']
        file_hash = calculate_file_hash(uploaded_file)

        with transaction.atomic():
            file_obj, created = File.objects.get_or_create(
                file_hash=file_hash,
                defaults={
                    'file': uploaded_file,
                    'original_filename': validated_data['original_filename'],
                    'file_type': validated_data['file_type'],
                    'size': validated_data['size']
                }
            )
            
            FileUpload.objects.create(
                file=file_obj,
                original_filename=validated_data['original_filename'],
                is_duplicate=not created
            )
            
            if not created:
                uploaded_file.close()
            
        return file_obj     

class CollectionViewPagination(PageNumberPagination):
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 100

class SearchViewPagination(CollectionViewPagination):

    page_query_param = 'page_num'

    def get_page_size(self, request):
        if self.page_size_query_param:
            try:
                return _positive_int(
                    request.data[self.page_size_query_param],
                )
            except (KeyError, ValueError):
                pass

        return self.page_size
    
    def paginate_queryset(self, queryset, request):
        page_size = self.get_page_size(request=request)
        paginator = self.django_paginator_class(queryset, page_size)

        page_number = request.data.get(self.page_query_param, 1)

        try:
            self.page = paginator.page(page_number)
        except InvalidPage as exc:
            msg = self.invalid_page_message.format(
                page_number=page_number, message=six.text_type(exc)
            )
            raise NotFound(msg)

        self.request = request
        return list(self.page)

class FilterSerializer(serializers.Serializer):
    FILTER_CHOICES = [
        ('exact', 'exact')
    ] 
    field = serializers.CharField()
    value = serializers.ListField(child=serializers.CharField())
    type = serializers.ChoiceField(choices=FILTER_CHOICES)

    def validate_field(self, data):
        filterable_fields = self.context['fields_meta_info']['filterable_fields']
        if data in [field['field'] for field in filterable_fields]:
            return data
        else:
            raise serializers.ValidationError(('Invalid Field'))

    #validate b/w actual data and meta_fields
    def validate(self, data):
        field = data['field']
        type_ = data['type']

        for field_ in self.context['fields_meta_info']['filterable_fields']:
            if field_['field'] == field and field_['extras']['type'] == 'list':
                type_ = 'contains'
                break
            elif field_['field'] == field and field_['extras']['type'] in ['number']:
                type_ = 'number'
                break
            elif field_['field'] == field and field_['extras']['type'] in ['date']:
                type_ = 'date'
                break

        data['type'] = type_

        return data

class SortSerializer(serializers.Serializer):
    ORDER_CHOICES = [
        ('asc', 'asc'),
        ('desc', 'desc')
    ]
    field = serializers.CharField()
    order = serializers.ChoiceField(choices=ORDER_CHOICES)

    def validate_field(self, data):
        sortable_fields = self.context['fields_meta_info']['sortable_fields']
        if data in [field['field'] for field in sortable_fields]:
            return data
        else:
            raise serializers.ValidationError(_('Invalid Field'))

class SearchRequestValidator(serializers.Serializer):
    query = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    def __init__(self, *args, **kwargs):
        super(SearchRequestValidator, self).__init__(*args, **kwargs)
        self.fields.update({
            'filters': FilterSerializer(many=True, context=self.context, required=False),
            'sort': SortSerializer(context=self.context, required=False)
        })

    def filter_queryset(self, queryset):
        if 'filters' not in self.validated_data:
            return queryset
        
        for _filter in self.validated_data['filters']:
            query = Q()
            _field = _filter['field']
            _value = _filter['value']
            _type = _filter['type']

            logger.info(f"filter --> {_filter}")

            if _type == 'number':
                for _range in _value:
                    split = _range.split('-')
                    min_value = int(split[0])
                    max_value = int(split[1])
                    query = query | Q(**{f'{_field}__gte':min_value, f'{_field}__lte': max_value})
            elif _type == 'date':
                for _range in _value:
                    split = _range.split('&')
                    from_date = datetime.datetime.strptime(split[0], "%Y-%m-%d")
                    to_date = datetime.datetime.strptime(split[1], "%Y-%m-%d")
                    
                    query = query & Q(**{f'{_field}__gte': from_date})
                    query = query & Q(**{f'{_field}__lte': to_date})

            else:
                for cur_value in _value:
                    query = query | Q(**{f'{_field}__{_type}':cur_value})
            
            queryset = queryset.filter(query)
        
        return queryset


    def search_queryset(self, queryset):
        if 'query' not in self.validated_data:
            return queryset
        
        fields_to_search = self.context['fields_meta_info']['searchable_fields']
        search_text = self.validated_data['query']

        search_query = Q()

        for search_field_ in fields_to_search:
            field_ = search_field_['field']

            search_query = Q(**{f'{field_}__icontains': search_text})

        if search_query:
            return queryset.filter(search_query)

        return queryset

    def sort_queryset(self, queryset):
        if 'sort' not in self.validated_data:
            return queryset

        sort_field = self.validated_data['sort']['field']
        sort_order = self.validated_data['sort']['order']

        # Dynamic Field Name Example (Why F is Needed):
        # sort_field = 'price'
        # queryset.order_by(sort_field)  # This is NOT the correct approach

        if sort_order == 'asc':
            queryset.order_by(
                F(sort_field).asc(nulls_last=True)
            )
        else:
            queryset = queryset.order_by(
                F(sort_field).desc(nulls_last=True))
        
        return queryset


    def filter_and_sort(self, queryset):
        self.is_valid(raise_exception=True)
        queryset = self.filter_queryset(queryset)
        queryset = self.search_queryset(queryset)
        queryset = self.sort_queryset(queryset)
        queryset = queryset.distinct()
        return queryset
    
