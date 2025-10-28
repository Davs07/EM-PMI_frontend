import { Participante } from './model';

export const fetchParticipantes = async (): Promise<Participante[]> => {
  try {
    const response = await fetch('http://localhost:8080/api/participante/listar');
    
    if (!response.ok) {
      throw new Error(`Error al obtener participantes: ${response.status}`);
    }
    
    const data = await response.json();
    
    const participantes: Participante[] = data.map((item: any) => ({
      id: item.id,
      nombres: item.nombres || '',
      apellidoPaterno: item.apellidoPaterno || '',
      apellidoMaterno: item.apellidoMaterno || '',
      dni: item.dni || '',
      email: item.email || '',
      numeroWhatsapp: item.numeroWhatsapp || '',
      ciudad: item.ciudad || '',
      rol: item.rol || '',
      gradoEstudio: item.gradoEstudio || '',
      evidenciaEstudio: item.evidenciaEstudio || undefined,
      capituloPmi: item.capituloPmi || '',
      idMiembroPmi: item.idMiembroPmi || '',
      cuentaConCertificadoPmi: item.cuentaConCertificadoPmi || false,
      asistencias: item.asistencias || [],
    }));
    
    return participantes;
  } catch (error) {
    console.error('Error fetching participantes:', error);
    throw error;
  }
};
