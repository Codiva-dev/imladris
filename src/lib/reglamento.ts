/**
 * Reglamento semilla del Consejo — pacto del círculo (no confundir con reglas de selección).
 */
export const DEFAULT_REGLAMENTO = `## Propósito

El Consejo existe para reunirse con intención: pensar juntos lo que importa, dejar huella y volver.

## Fecha

Cuando haya suficiente coincidencia entre los miembros, el organizador confirma una fecha. La aplicación nunca agenda sola.

## Reunión

El Consejo dura lo que el círculo acuerde (orientativo: unas dos horas). Puede haber material de lectura opcional. Cada miembro confirma su asistencia: voy, tal vez o no voy.

## Respeto

Se habla con respeto. Se escucha. El Consejo es un lugar de confianza, no de espectáculo.

## Bitácora

Tras la reunión, la bitácora permanece abierta **72 horas**. Sirve para dejar una reflexión, idea, pregunta o próxima acción — privada, compartida o anónima. Lo compartido alimenta el mapa del conocimiento.

## Temas

Durante la convocatoria, cada miembro puede proponer hasta dos temas. Entran al banco del Consejo. El organizador elige entre los candidatos que permiten las reglas de selección, junto con un enfoque.
`;

export function resolveReglamento(stored: string | null | undefined): string {
  const text = stored?.trim();
  return text && text.length > 0 ? text : DEFAULT_REGLAMENTO;
}
