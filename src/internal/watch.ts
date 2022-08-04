interface WatchOptions {
  waitUntilFirstUpdate?: boolean;
}

export function watch(propName: string, options?: WatchOptions) {
  return (protoOrDescriptor: any, name: string): any => {
    const { willUpdate } = protoOrDescriptor;

    options = Object.assign({ waitUntilFirstUpdate: false }, options) as WatchOptions;

    protoOrDescriptor.willUpdate = function (changedProps: Map<string, any>) {
      willUpdate.call(this, changedProps);

      if (changedProps.has(propName)) {
        const oldValue = changedProps.get(propName);
        const newValue = this[propName];

        if (oldValue !== newValue) {
          if (!options?.waitUntilFirstUpdate || this.hasUpdated) {
            this[name].call(this, oldValue, newValue);
          }
        }
      }
    };
  };
}
