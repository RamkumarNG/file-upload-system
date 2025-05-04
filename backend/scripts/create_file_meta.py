#!/usr/bin/env python
import sys
import os

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django

django.setup()

from files.models import Form, FormElement, FormField

file_form, _ = Form.objects.get_or_create(title='file_meta')
single_choice_formelement = FormElement.objects.get(label="Single Choice")
text_formelement = FormElement.objects.get(label="Text Box")
date_formelement = FormElement.objects.get(label="Date Picker")
number_formelement = FormElement.objects.get(label="Number Box")

fields = [
    {
        "label": "File Name",
        "field": "original_filename",
        "is_required": True,
        "searchable": True,
        "form": file_form,
        "form_element": text_formelement,
        "extras": {
            "path": "feed_id",
        }
    },
    {
        "label": "Type",
        "field": "file_type",
        "is_required": True,
        "filterable": True,
        "form_element": single_choice_formelement,
        "form": file_form,
        "extras": {
            "path": "type",
            "type": "list"
        },
        "values": [
            {"label": "jpeg", "value": "image/jpeg"},
            {"label": "png", "value": "image/png"},
        ],
    },
    {
        "label": "Size",
        "field": "size",
        "filterable": False,
        "form": file_form,
        "form_element": number_formelement,
        "extras": {
            "path": "type",
            "type": "number",
            "dynamic": False,
        },
        "values": [
            {"label": "0–100 KB", "value": "0-102400"},
            {"label": "100–500 KB", "value": "102400-512000"},
            {"label": "500 KB–1 MB", "value": "512000-1048576"},
            {"label": "1–5 MB", "value": "1048576-5242880"},
            {"label": "5–10 MB", "value": "5242880-10485760"},
        ]
    },
    {
        "label": "Upload Date",
        "field": "uploaded_at",
        "is_required": True,
        "filterable": True,
        "form": file_form,
        "form_element": date_formelement,
        "extras": {
            "path": "uploaded_at",
            "type": "date"
        }
    }
]


def main():
    for opts in fields:
        try:
            form_field = FormField.objects.get(field=opts['field'], form=opts['form'])
        except FormField.DoesNotExist:
            form_field = FormField()
        
        for opt, value in opts.items():
            setattr(form_field, opt, value)
        
        form_field.save()


if __name__ == '__main__':
    main()
