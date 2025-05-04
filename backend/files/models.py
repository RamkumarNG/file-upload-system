from django.db import models
import uuid
import os

def file_upload_path(instance, filename):
    """Generate file path for new file upload"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('uploads', filename)

class File(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.FileField(upload_to=file_upload_path)
    file_hash = models.CharField(max_length=64, unique=True, db_index=True, null=True, blank=True)
    original_filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    size = models.BigIntegerField()
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return self.original_filename

class FileUpload(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    file = models.ForeignKey(File, on_delete=models.CASCADE)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    original_filename = models.CharField(max_length=255)
    is_duplicate = models.BooleanField(default=False)

    class Meta:
        ordering = ['-uploaded_at']
        db_table = 'file_upload'


class Form(models.Model):
    title = models.CharField(max_length=15)

    def get_meta_fields(self, form) -> dict:
        meta_info = {
            "sortable_fields": {},
            "filterable_fields": {},
            "display_in_list": {},
            "searchable_fields": {}
        }

        sort_orders_map = {
            'date': [
                ('asc', 'Oldest First'),
                ('desc', 'Latest First')
            ],
            'number': [
                ('asc', 'Low'),
                ('desc', 'High')
            ]
        }

        fields = FormField.objects.filter(form=form).select_related('form_element')

        for field in fields:
            response_data_path = field.field

            if field.searchable:
                meta_info['searchable_fields'][response_data_path]={
                    'field': response_data_path,
                    'label': field.label
                }

            if field.sortable:
                sort_order_with_label_suffix = sort_orders_map.get(
                    field.form_element.value_type, [('asc', 'A-Z'), ('desc', 'Z-A')]
                )
                for sort_opt, suffix in sort_order_with_label_suffix:
                    meta_info['sortable_fields'][f'{response_data_path}_{sort_opt}'] = {
                        'label': f'{field.label}:{suffix}',
                        'field': response_data_path,
                        'default': True if response_data_path == 'created_date' and sort_opt == 'desc' else False
                    }

            if field.filterable:
                filter_data = {
                    'label': field.label,
                    'field': response_data_path,
                    'help': '',
                    'values': field.values,
                    'extras': field.extras,
                }
            
                meta_info['filterable_fields'][response_data_path]=filter_data

        return meta_info
    
    class Meta:
        db_table = 'form'

class FormElement(models.Model):
    label = models.CharField(max_length=15)
    element_type = models.CharField(max_length=15)
    value_type = models.CharField(max_length=15)
    
    class Meta:
        db_table = 'form_element'

class FormField(models.Model):
    form = models.ForeignKey(Form, on_delete=models.PROTECT)
    form_element = models.ForeignKey(FormElement, on_delete=models.PROTECT)
    field = models.CharField(max_length=15)
    label = models.CharField(max_length=15)
    values = models.JSONField(blank=True, null=True)
    placeholder = models.CharField(max_length=255, blank=True, null=True)
    is_required = models.BooleanField(default=False)
    extras = models.JSONField(blank=True, null=True)
    sortable = models.BooleanField(default=False)
    filterable = models.BooleanField(default=False)
    searchable = models.BooleanField(default=False)

    class Meta:
        db_table = 'form_field'
