type ApexComponent = CustomElementConstructor & {
  is: string;
  register: () => void;
};

export function registerComponent(component: ApexComponent, dependencies: ApexComponent[] = []) {
  for (const dependency of dependencies) {
    dependency.register();
  }

  if (!customElements.get(component.is)) {
    customElements.define(component.is, component);
  }
}
