from django.db import migrations
import random


def generate_pin_for_rooms(apps, schema_editor):
    """Generate unique 9-digit PIN codes for existing rooms.

    The PIN code is required for upcoming SIP telephony features.
    """
    Room = apps.get_model('core', 'Room')
    rooms_without_pin = Room.objects.filter(pin_code__isnull=True)

    def generate_pin():
        while True:
            pin = str(random.randint(0, 999999999)).zfill(9)
            if not Room.objects.filter(pin_code=pin).exists():
                return pin

    for room in rooms_without_pin:
        room.pin_code = generate_pin()
        room.save()


class Migration(migrations.Migration):
    dependencies = [
        ('core', '0011_room_pin_code'),
    ]

    operations = [
        migrations.RunPython(
            generate_pin_for_rooms,
            reverse_code=migrations.RunPython.noop
        ),
    ]
