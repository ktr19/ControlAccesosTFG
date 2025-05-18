from marshmallow import Schema, fields, validate, validates, validates_schema, ValidationError
from datetime import datetime

class EmployeeSchema(Schema):
    """
    Esquema de validación para la entidad Employee usando Marshmallow.

    Este esquema define los campos permitidos, sus tipos, restricciones,
    y validaciones personalizadas para asegurar la integridad de los datos
    al crear o actualizar empleados.
    """

    employee_id = fields.Integer(dump_only=True)
    company_id = fields.Integer(required=True)
    office_id = fields.Integer(allow_none=True)

    first_name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=255),
        metadata={"description": "Nombre del empleado"}
    )
    last_name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=255),
        metadata={"description": "Apellido del empleado"}
    )
    email = fields.Email(
        required=True,
        validate=validate.Length(max=255),
        metadata={"description": "Correo electrónico único"}
    )
    password = fields.String(
        load_only=True,
        required=True,
        validate=validate.Length(min=8, max=255),
        metadata={"description": "Contraseña segura del empleado"}
    )
    role = fields.String(
        validate=validate.OneOf(['employee', 'admin']),
        load_default='employee',
        metadata={"description": "Rol dentro del sistema"}
    )
    is_active = fields.Boolean(load_default=True)
    is_locked = fields.Boolean(load_default=False)
    last_login = fields.DateTime(allow_none=True)
    creation_date = fields.DateTime(dump_only=True)
    entry_date = fields.DateTime(allow_none=True, load_default=None)
    exit_date = fields.DateTime(allow_none=True, load_default=None)

    qr_code = fields.String(
        allow_none=True,
        validate=validate.Length(max=255),
        metadata={"description": "Código QR asignado"}
    )

    @validates("password")
    def validate_password_complexity(self, value, *args, **kwargs):
        """
        Valida que la contraseña tenga al menos un número y una letra mayúscula.

        Args:
            value (str): Contraseña proporcionada por el usuario.

        Raises:
            ValidationError: Si la contraseña no cumple con los requisitos de seguridad.
        """
        if not any(char.isdigit() for char in value):
            raise ValidationError("La contraseña debe contener al menos un número.")
        if not any(char.isupper() for char in value):
            raise ValidationError("La contraseña debe contener al menos una letra mayúscula.")

    @validates("entry_date")
    def validate_entry_date(self, value, *args, **kwargs):
        """
        Verifica que la fecha de entrada no sea futura.

        Args:
            value (datetime): Fecha de entrada.

        Raises:
            ValidationError: Si la fecha de entrada es posterior a la fecha actual.
        """
        if value and value > datetime.now():
            raise ValidationError("La fecha de entrada no puede ser futura.")

    @validates("exit_date")
    def validate_exit_date(self, value, *args, **kwargs):
        """
        Verifica que la fecha de salida no sea futura.

        Args:
            value (datetime): Fecha de salida.

        Raises:
            ValidationError: Si la fecha de salida es posterior a la fecha actual.
        """
        if value and value > datetime.now():
            raise ValidationError("La fecha de salida no puede ser futura.")

    @validates_schema
    def validate_exit_after_entry(self, data, **kwargs):
        """
        Verifica que la fecha de salida no sea anterior a la de entrada,
        si ambas están presentes.

        Args:
            data (dict): Datos validados del esquema.

        Raises:
            ValidationError: Si la fecha de salida es anterior a la de entrada.
        """
        if 'exit_date' in data and data.get('exit_date') is not None:
            entry = data.get('entry_date')
            exit_ = data.get('exit_date')
            if entry and exit_ and exit_ < entry:
                raise ValidationError(
                    "La fecha de salida no puede ser anterior a la de entrada.",
                    field_name='exit_date'
                )
