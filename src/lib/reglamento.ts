/**
 * Reglamento semilla del Consejo (pacto del círculo).
 * No confundir con las reglas técnicas de selección del banco.
 */
export const DEFAULT_REGLAMENTO = `## Propósito

Somos un círculo cerrado que se reúne para pensar en serio. No es un club social ni un hilo de mensajes: es el compromiso de presentarse, sostener una pregunta y salir con algo más claro que cuando se entró. Lo que queda escrito alimenta la memoria del Consejo.

## Fecha

Cuando bastantes miembros coinciden en un horario, el organizador elige y confirma. La app no fija fechas por su cuenta.

## Reunión

Dos horas, salvo que el círculo acuerde otra cosa. Puede haber lectura previa. Cada quien marca si va, si duda o si no puede.

## Respeto

Se habla claro y se escucha hasta el final. Nadie interrumpe para lucirse. Lo que se diga aquí se trata con cuidado.

## Bitácora

Al cerrar la reunión, quedan **72 horas** para dejar una nota: reflexión, idea, pregunta o próxima acción. Puede ser privada, compartida o anónima. Solo lo compartido pasa al mapa.

## Temas

En la convocatoria, cada miembro puede proponer hasta dos temas. Van al banco. El organizador elige entre los candidatos que permiten las reglas de selección, y un enfoque para orientar la conversación.
`;

export function resolveReglamento(stored: string | null | undefined): string {
  const text = stored?.trim();
  return text && text.length > 0 ? text : DEFAULT_REGLAMENTO;
}
