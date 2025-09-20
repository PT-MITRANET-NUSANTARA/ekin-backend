export class UnitOrganisasiDto {
  id: string;
  nama: string;
  parent_id: string;
  children?: UnitOrganisasiDto[];
}
