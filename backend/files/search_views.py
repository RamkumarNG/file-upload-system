from django.http import JsonResponse
from rest_framework import views, status

import traceback
import logging

from .models import File
from .views import FileViewList
from .serializers import SearchRequestValidator, SearchViewPagination, FileSerializer

logger = logging.getLogger(__name__)

class BaseHandler:

    def __init__(self, request_data=None):
        self.fields_meta_info = None
        self.request_data = request_data

class FileViewHandler(BaseHandler):
    @staticmethod
    def get_queryset():
        queryset = File.objects.all()
        return queryset
    
    def get_unique_col_values(self, col: str):
        queryset = File.objects.values_list(col, flat=True).distinct()
        return queryset

    def get_serializer_context(self, queryset, request):
        context = {
            'display_in_list': self.fields_meta_info.get('display_in_list'),
            'request' : request
        }
        return context

    def get_fields_meta_info(self, request):
        self.fields_meta_info = FileViewList.fields_meta_info()
        return self.fields_meta_info
    
    def serialize(self, queryset):
        serializer = FileSerializer(instance=queryset, many=True)
        return serializer.data
    
class SearchView(views.APIView):
    
    handler = None

    def get_paginated_response(self, queryset):

        paginator = SearchViewPagination()
        queryset = paginator.paginate_queryset(queryset, self.request)
        data = self.handler.serialize(queryset)
        response = paginator.get_paginated_response(data)
        results = response.data.pop('results', [])
        response.data = {
            'meta': response.data,
            'results': results
        }
        return response

    def post(self, request):
        try:
            self.handler = FileViewHandler(dict(self.request.GET))
        
            queryset = self.handler.get_queryset()

            search_context = {
                'fields_meta_info': self.handler.get_fields_meta_info(request=request)
            }

            search_request_serializer = SearchRequestValidator(
                data=request.data,
                context=search_context
            )
            search_request_serializer.is_valid(raise_exception=True)

            queryset = search_request_serializer.filter_and_sort(queryset=queryset)
            paginated_response = self.get_paginated_response(queryset=queryset)

            return paginated_response
        
        except Exception as e:
            logger.error("Exception on search: Error{}".format(e))
            logger.error("Exception on search: Traceback{}".format(traceback.format_exc()))

            return JsonResponse(data={
                "status": "failure",
                "message": "something went wrong"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MetaInfoView(views.APIView):
    
    handler = None

    def get(self, request):
        try:
            self.handler = FileViewHandler()
            meta_info = self.handler.get_fields_meta_info(request=request)

            for ff in meta_info["filterable_fields"]:
                if ff['extras'].get('type', '') != 'date':
                    _column_name = ff['field']
                    values = self.handler.get_unique_col_values(_column_name)

                    if ff['field'] == 'file_type':
                        unique_pairs = {
                            (val.split('/')[-1], val)
                            for val in values if val
                        }
                        new_values = [
                            {"label": label, "value": value} for label, value in unique_pairs
                        ]
                        
                        existing_values = ff.get('values', [])
                        combined = existing_values + new_values
                        ff['values'] = list({v['value']: v for v in combined}.values())
                    else:
                        new_values = sorted(set(filter(None, values)))
                        if ff.get('values') and ff.get('extras', {}).get('dynamic'):
                            existing_values = ff['values']
                            ff['values'] = sorted(set(existing_values + new_values))

            return JsonResponse(
                data={
                    "status": "success",
                    "message": "",
                    "data": meta_info
                }, status=status.HTTP_200_OK
            )
            
        
        except Exception as e:
            logger.error("Exception on MetaInfo: Error{}".format(e))
            logger.error("Exception on MetaInfo: Traceback{}".format(traceback.format_exc()))

            return JsonResponse(data={
                "status": "failure",
                "message": "something went wrong"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
