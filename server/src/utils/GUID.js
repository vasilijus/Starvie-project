export function generateGUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> (c === 'x' ? 0 : 3);
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
    
    // const array = new Uint32Array(8);
    // window.crypto.getRandomValues(array);
    // let str = '';
    // for (let i = 0; i < array.length; i++) {
    //   str += array[i].toString(16).padStart(8, '0');
    // }
    // return str;
}
// console.log(generateGUID());