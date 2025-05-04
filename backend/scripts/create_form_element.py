#!/usr/bin/env python
import sys
import os
from django.core.management import execute_from_command_line

# Add project root to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set Django settings module
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
django.setup()


from files.models import FormElement

form_elements_data = [
    {
        "label": "Single Choice",
        "element_type": "select",
        "value_type": "string"
    },
    {
        "label": "Text Box",
        "element_type": "text",
        "value_type": "string"
    },
    {
        "label": "Date Picker",
        "element_type": "date",
        "value_type": "date"
    },
    {
        "label": "Number Box",
        "element_type": "text",
        "value_type": "number"
    }
]

def main():
    for data in form_elements_data:
        obj, created = FormElement.objects.get_or_create(
            label=data["label"],
            defaults={
                "element_type": data["element_type"],
                "value_type": data["value_type"]
            }
        )
        if created:
            print(f"Created: {obj.label}")
        else:
            print(f"Already exists: {obj.label}")

if __name__ == '__main__':
    main()
