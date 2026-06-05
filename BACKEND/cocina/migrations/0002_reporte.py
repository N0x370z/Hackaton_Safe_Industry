from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('cocina', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Reporte',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('zona_nombre', models.CharField(max_length=100)),
                ('tipo', models.CharField(choices=[
                    ('insecto_avistado', 'Insecto avistado'),
                    ('roedor_avistado', 'Roedor avistado'),
                    ('residuos_acumulados', 'Residuos acumulados'),
                    ('dano_estructural', 'Daño estructural'),
                    ('mal_olor', 'Mal olor'),
                    ('otro', 'Otro'),
                ], max_length=30)),
                ('descripcion', models.TextField(blank=True)),
                ('creado_en', models.DateTimeField(auto_now_add=True)),
                ('zona', models.ForeignKey(
                    blank=True, null=True,
                    on_delete=django.db.models.deletion.SET_NULL,
                    related_name='reportes', to='cocina.zona'
                )),
            ],
            options={'ordering': ['-creado_en']},
        ),
    ]
