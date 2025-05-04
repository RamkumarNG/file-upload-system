from django.http import JsonResponse
from django.db.models import Sum

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import NotFound

from .models import File, Form
from .serializers import FileSerializer, FileUpload
from .utils import to_mb

import traceback
import logging

logger = logging.getLogger(__name__)

class FileViewList:
    @staticmethod
    def fields_meta_info():
        form = Form.objects.get(title="file_meta")

        meta_info = form.get_meta_fields(form)
        (
            sortable_fields,
            filterable_fields,
            display_in_list,
            searchable_fields,
        ) = meta_info.values()

        return {
            "sortable_fields": list(sortable_fields.values()),
            "filterable_fields": list(filterable_fields.values()),
            "searchable_fields": list(searchable_fields.values()),
            "display_in_list": list(display_in_list.values()),
        }

class FileViewSet(viewsets.ModelViewSet):
    queryset = File.objects.all()
    serializer_class = FileSerializer

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({'error': 'No file provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        data = {
            'file': file_obj,
            'original_filename': file_obj.name,
            'file_type': file_obj.content_type,
            'size': file_obj.size
        }
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def destroy(self, request, pk, *args, **kwars):
        try:
            instance = self.get_object()
            self.perform_destroy(instance)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except File.DoesNotExist:
            raise NotFound(detail="File not found")
        except Exception as e:
            logger.error("Exception on search: Error{}".format(e))
            logger.error("Exception on search: Traceback{}".format(traceback.format_exc()))

            return JsonResponse(data={
                "status": "failure",
                "message": "Unable to delete, pls try again later"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def retrieve(self, request, pk,):
        pass

    @action(methods=['GET'], url_path='get_storage', detail=False, name='Track Storage Savings')
    def get_storage(self, request):
        try:
            total_uploaded_size = FileUpload.objects.aggregate(total=Sum('file__size'))['total'] or 0
            actual_storage_used = File.objects.aggregate(total=Sum('size'))['total'] or 0
            savings = total_uploaded_size - actual_storage_used

            return JsonResponse({
                "message": "Storage savings calculated successfully",
                "status": "success",
                "data": {
                    "total_uploaded": to_mb(total_uploaded_size),
                    "actual_storage": to_mb(actual_storage_used),
                    "savings": to_mb(savings),
                }
            }, status=status.HTTP_200_OK)
        except Exception as e:
            logger.exception("Exception on storage savings: Error{}".format(e))
            logger.exception("Exception on storage savings: Traceback{}".format(traceback.format_exc()))
            return JsonResponse(data={
                "status": "failure",
                "message": "Unable to calculate storage savings, pls try again later"
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
