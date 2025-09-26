/**
 * Interface untuk data perilaku
 */
export interface IPerilaku {
  /**
   * Nama perilaku
   */
  name: string;

  /**
   * Isi/kriteria perilaku (array of string)
   */
  isi: string[];

  /**
   * Ekspektasi perilaku
   */
  espektasi: string;
}
