-- Estado de acceso 'pending': al asignar un inversor a un proyecto, la
-- asignación nace como INVITACIÓN pendiente. El inversor la acepta o rechaza
-- desde su portal; solo una asignación 'active' muestra el proyecto.
ALTER TYPE dataroom.access_status ADD VALUE IF NOT EXISTS 'pending';
