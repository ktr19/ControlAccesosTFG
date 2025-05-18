from marshmallow import Schema, fields, validate, validates, ValidationError
from datetime import datetime

class CompanySchema(Schema):
    """
    Esquema de validación para la entidad Company usando Marshmallow.

    Este esquema define las reglas y restricciones necesarias para validar
    los datos de una compañía antes de ser procesados o almacenados.
    """

    company_id = fields.Integer(dump_only=True, metadata={"description": "ID único de la compañía"})
    name = fields.String(
        required=True,
        validate=validate.Length(min=1, max=255),
        metadata={"description": "Nombre de la compañía"}
    )
    acronym = fields.String(
        allow_none=True,
        validate=validate.Length(max=50),
        metadata={"description": "Acrónimo o sigla de la compañía"}
    )
    nif = fields.String(
        required=True,
        validate=validate.Length(min=1, max=20),
        metadata={"description": "Número de Identificación Fiscal (único y alfanumérico)"}
    )
    creation_date = fields.DateTime(
        dump_only=True,
        metadata={"description": "Fecha de creación automática en la base de datos"}
    )

    @validates("nif")
    def validate_nif_format(self, value):
        """
        Valida que el NIF (Número de Identificación Fiscal) sea alfanumérico.

        Args:
            value (str): Valor del NIF proporcionado.

        Raises:
            ValidationError: Si el NIF contiene caracteres no alfanuméricos.
        """
        if not value.isalnum():
            raise ValidationError("El NIF debe ser alfanumérico.")
