import { getConnection } from 'typeorm';
export default function (entity: any, dto: any) {
  const model = new entity();
  const fields = getConnection()
    .getMetadata(entity)
    .ownColumns.map((column) => column.propertyName);
  const keys = Object.keys(dto);

  for (const key of keys) {
    if (fields.indexOf(key) != -1) {
      model[key] = dto[key];
    }
  }
  return model;
}
