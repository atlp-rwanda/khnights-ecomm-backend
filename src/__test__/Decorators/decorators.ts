export function myDecorator(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    console.log("myDecorator called on: ", target, propertyKey, descriptor);
}
