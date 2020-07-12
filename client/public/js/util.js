export function createNode(nodeType, attributes = {}, children = []) {
  const node = document.createElement(nodeType);

  const { classes, ...otherAttributes } = attributes;

  Object.entries(otherAttributes).forEach(([attr, val]) => {
    node[attr] = val;
  });

  classes.split(" ").forEach(cls => {
    node.classList.add(cls);
  });

  children.forEach(child => {
    node.appendChild(child);
  });

  return node;
}

export const videoNode = createNode.bind(null, "video");
export const canvasNode = createNode.bind(null, "canvas");
