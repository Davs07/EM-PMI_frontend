export interface Asistencia {
  id: number;
  participante?: Participante;
  // Add other fields as needed based on the Asistencia entity
}

export interface Participante {
  id: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  dni: string;
  email: string;
  numeroWhatsapp: string;
  ciudad: string;
  rol: string;
  gradoEstudio: string;
  evidenciaEstudio?: string; // Base64 string or URL for the byte array
  capituloPmi: string;
  idMiembroPmi: string;
  cuentaConCertificadoPmi: boolean;
  asistencias?: Asistencia[];
}