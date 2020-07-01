window.$ = document.querySelector.bind(document);

window.$$ = document.querySelectorAll.bind(document);

Node.prototype.on = window.on = function(name, fn) {
  this.addEventListener(name, fn);
  return this;
};

NodeList.prototype.__proto__ = Array.prototype;

NodeList.prototype.on = NodeList.prototype.addEventListener = function(
  name,
  fn
) {
  this.forEach(function(elem, i) {
    elem.on(name, fn);
  });
  return this;
};

function createNode(nodeType, attributes = {}, children = []) {
  const node = document.createElement(nodeType);

  Object.entries(attributes).forEach(([attr, val]) => {
    node[attr] = val;
  });

  children.forEach(child => {
    node.appendChild(child);
  });

  return node;
}

window.H = {
  createNode,
  div: createNode.bind(null, "div"),
  p: createNode.bind(null, "p"),
  button: createNode.bind(null, "button"),
  video: createNode.bind(null, "video")
};
