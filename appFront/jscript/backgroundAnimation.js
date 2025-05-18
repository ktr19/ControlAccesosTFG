export const createBackgroundAnimation = () => {
  const canvas = document.createElement('canvas');
  document.body.appendChild(canvas); // Añadimos el canvas al body
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {}; // Si no hay contexto, retornamos una función vacía.

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const nodes = [];
  const connections = [];
  const numNodes = 50;
  const nodeRadius = 5;

  // Ajustamos la velocidad de los nodos a un valor más bajo para que se muevan más despacio
  const nodeSpeed = 0.5; // Velocidad más baja para un movimiento más lento

  // Colores acordes a tu paleta (azul y morado)
  const nodeColors = ['#2563eb', '#8b5cf6']; // Azul y morado

  // Crear nodos
  for (let i = 0; i < numNodes; i++) {
    nodes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      dx: (Math.random() - 0.5) * nodeSpeed, // Velocidad en x
      dy: (Math.random() - 0.5) * nodeSpeed, // Velocidad en y
      color: nodeColors[i % nodeColors.length], // Alternar entre los colores
    });
  }

  // Crear conexiones aleatorias entre los nodos
  const createConnections = () => {
    connections.length = 0; // Limpiar conexiones previas
    for (let i = 0; i < numNodes; i++) {
      for (let j = i + 1; j < numNodes; j++) {
        const dist = Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y);
        if (dist < 200) { // Solo crear conexión si la distancia entre nodos es menor a 200px
          connections.push([i, j]);
        }
      }
    }
  };

  let animationFrameId; // Variable para almacenar el id del requestAnimationFrame

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Limpiar el lienzo
    createConnections(); // Crear las conexiones para este frame

    // Dibuja las conexiones
    ctx.strokeStyle = '#ffffff'; // Color de las líneas (blanco)
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    connections.forEach(([i, j]) => {
      ctx.moveTo(nodes[i].x, nodes[i].y);
      ctx.lineTo(nodes[j].x, nodes[j].y);
    });
    ctx.stroke();

    // Dibuja los nodos
    nodes.forEach((node) => {
      ctx.beginPath();
      ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();

      // Actualizamos la posición de los nodos para crear el movimiento
      node.x += node.dx;
      node.y += node.dy;

      // Colisiones con los bordes del canvas para hacer que los nodos reboten
      if (node.x + nodeRadius > canvas.width || node.x - nodeRadius < 0) {
        node.dx = -node.dx;
      }
      if (node.y + nodeRadius > canvas.height || node.y - nodeRadius < 0) {
        node.dy = -node.dy;
      }
    });

    // Solicitar el siguiente frame de animación
    animationFrameId = requestAnimationFrame(draw);
  };

  draw(); // Iniciar la animación

  // Función de limpieza que detiene la animación
  const cleanup = () => {
    cancelAnimationFrame(animationFrameId); // Detener la animación
    document.body.removeChild(canvas); // Eliminar el canvas del DOM
  };

  return cleanup; // Retornar la función de limpieza
};
