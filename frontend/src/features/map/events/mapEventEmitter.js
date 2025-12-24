const mapEventEmitter = new EventTarget();

mapEventEmitter.emit = (eventType, payload) => {
    const event = new CustomEvent(eventType, { detail: payload });
    mapEventEmitter.dispatchEvent(event);
};

mapEventEmitter.subscribe = (eventType, callback) => {
    mapEventEmitter.addEventListener(eventType, callback);
    return () => mapEventEmitter.removeEventListener(eventType, callback);
};

export { mapEventEmitter };
