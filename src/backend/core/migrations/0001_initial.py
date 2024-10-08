# Generated by Django 5.0.3 on 2024-07-16 15:30

import django.contrib.auth.models
import django.core.validators
import django.db.models.deletion
import timezone_field.fields
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='Resource',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='primary key for the record as UUID', primary_key=True, serialize=False, verbose_name='id')),
                ('created_at', models.DateTimeField(auto_now_add=True, help_text='date and time at which a record was created', verbose_name='created on')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='date and time at which a record was last updated', verbose_name='updated on')),
                ('is_public', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Resource',
                'verbose_name_plural': 'Resources',
                'db_table': 'meet_resource',
            },
        ),
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='primary key for the record as UUID', primary_key=True, serialize=False, verbose_name='id')),
                ('created_at', models.DateTimeField(auto_now_add=True, help_text='date and time at which a record was created', verbose_name='created on')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='date and time at which a record was last updated', verbose_name='updated on')),
                ('sub', models.CharField(blank=True, help_text='Required. 255 characters or fewer. Letters, numbers, and @/./+/-/_ characters only.', max_length=255, null=True, unique=True, validators=[django.core.validators.RegexValidator(message='Enter a valid sub. This value may contain only letters, numbers, and @/./+/-/_ characters.', regex='^[\\w.@+-]+\\Z')], verbose_name='sub')),
                ('email', models.EmailField(blank=True, max_length=254, null=True, verbose_name='identity email address')),
                ('admin_email', models.EmailField(blank=True, max_length=254, null=True, unique=True, verbose_name='admin email address')),
                ('language', models.CharField(choices="(('en-us', 'English'), ('fr-fr', 'French'))", default='en-us', help_text='The language in which the user wants to see the interface.', max_length=10, verbose_name='language')),
                ('timezone', timezone_field.fields.TimeZoneField(choices_display='WITH_GMT_OFFSET', default='UTC', help_text='The timezone in which the user wants to see times.', use_pytz=False)),
                ('is_device', models.BooleanField(default=False, help_text='Whether the user is a device or a real user.', verbose_name='device')),
                ('is_staff', models.BooleanField(default=False, help_text='Whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'verbose_name': 'user',
                'verbose_name_plural': 'users',
                'db_table': 'meet_user',
            },
            managers=[
                ('objects', django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name='Room',
            fields=[
                ('name', models.CharField(max_length=500)),
                ('resource', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, parent_link=True, primary_key=True, serialize=False, to='core.resource')),
                ('slug', models.SlugField(blank=True, max_length=100, null=True, unique=True)),
                ('configuration', models.JSONField(blank=True, default={}, help_text='Values for Visio parameters to configure the room.', verbose_name='Visio room configuration')),
            ],
            options={
                'verbose_name': 'Room',
                'verbose_name_plural': 'Rooms',
                'db_table': 'meet_room',
                'ordering': ('name',),
            },
            bases=('core.resource',),
        ),
        migrations.CreateModel(
            name='ResourceAccess',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, help_text='primary key for the record as UUID', primary_key=True, serialize=False, verbose_name='id')),
                ('created_at', models.DateTimeField(auto_now_add=True, help_text='date and time at which a record was created', verbose_name='created on')),
                ('updated_at', models.DateTimeField(auto_now=True, help_text='date and time at which a record was last updated', verbose_name='updated on')),
                ('role', models.CharField(choices=[('member', 'Member'), ('administrator', 'Administrator'), ('owner', 'Owner')], default='member', max_length=20)),
                ('resource', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='accesses', to='core.resource')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='accesses', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Resource access',
                'verbose_name_plural': 'Resource accesses',
                'db_table': 'meet_resource_access',
            },
        ),
        migrations.AddField(
            model_name='resource',
            name='users',
            field=models.ManyToManyField(related_name='resources', through='core.ResourceAccess', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddConstraint(
            model_name='resourceaccess',
            constraint=models.UniqueConstraint(fields=('user', 'resource'), name='resource_access_unique_user_resource', violation_error_message='Resource access with this User and Resource already exists.'),
        ),
    ]
