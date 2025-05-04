import subprocess

# Django Imports
from django.core import management
from django.core.management.base import BaseCommand


SCRIPTS_FOLDER = "/app/scripts"

SCRIPTS_TO_RUN = [
    "create_form_element.py",
    "create_file_meta.py",
]

# In Django, BaseCommand is used to define custom management commands.
# The Command class inherits from BaseCommand, and the handle method is overridden to define the logic of the custom command

# Django provides built-in commands like migrate, runserver, and makemigrations. However, sometimes you may need to write your own logic,
# and that's where BaseCommand comes in. By inheriting from it, you can create a command that can be run from the command line.


class Command(BaseCommand):
    help = "Run migrations and post-migration scripts"

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS("Running migrations..."))
        management.call_command("migrate", verbosity=2, interactive=False)

        for script in SCRIPTS_TO_RUN:
            script_path = f"{SCRIPTS_FOLDER}/{script}"
            self.stdout.write(self.style.NOTICE(f"Running {script_path}..."))
            
            result = subprocess.run(["python", script_path], capture_output=True, text=True)

            if result.returncode != 0:
                self.stderr.write(self.style.ERROR(
                    f"Script {script} failed with error:\n{result.stderr}"
                ))
                break
            else:
                self.stdout.write(self.style.SUCCESS(f"{script} completed successfully."))
