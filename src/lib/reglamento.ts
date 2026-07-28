/**
 * Reglamento semilla del Consejo (pacto del círculo).
 * No confundir con las reglas técnicas de selección del banco.
 */
export const DEFAULT_REGLAMENTO = `## Propósito

Venimos a pensar. No a opinar de prisa ni a acumular conversación vacía.

El Consejo existe para nutrir la mente y el espíritu: sostener preguntas difíciles, mirarlas con calma y salir un poco más enteros. Cada reunión es un acto deliberado de atención compartida.

## Organización

Cualquier miembro del círculo puede ser organizador. Quien organiza no vuelve a hacerlo hasta que todos los demás hayan pasado por el cargo. Cuando la ronda se completa, vuelve a empezar.

Al cerrar una reunión (tras la bitácora), la organización pasa al siguiente miembro que aún no haya organizado en esa ronda. También puede cederse a mano cuando no hay convocatoria abierta.

## Fecha

Cuando suficientes miembros coinciden en un horario, el organizador elige y confirma.

## Reunión

Dos horas, salvo que el círculo acuerde otra cosa. Puede haber lectura previa. Cada quien marca si va, si duda o si no puede.

## Respeto

Se habla claro y se escucha hasta el final. Nadie interrumpe para lucirse. Lo que se diga aquí se trata con cuidado.

## Bitácora

Al cerrar la reunión, quedan **72 horas** para dejar una nota: reflexión, idea, pregunta o próxima acción. Puede ser privada, compartida o anónima. Solo lo compartido pasa al mapa.

## Temas

En la convocatoria, cada miembro puede proponer hasta dos temas. Van al banco. El organizador elige entre los candidatos que permiten las reglas de selección. El enfoque se sortea al azar entre los enfoques del Consejo.

## Mapa

El mapa es la memoria visible del Consejo. Cada tema tratado se vuelve una estrella. Las notas compartidas de la bitácora dejan ecos ligados a ese tema. Con el tiempo se forma un cielo: lo que pensamos juntos, visto de un vistazo.
`;

export function resolveReglamento(stored: string | null | undefined): string {
  const text = stored?.trim();
  return text && text.length > 0 ? text : DEFAULT_REGLAMENTO;
}
