import Class from './module';

class FooShared {
    // meta = {
    //     arguments: {
    //         foo: 'name'
    //     }
    // }
    shared() {}
}
class FooMix {
    //mix = 'yes'
    mix () {}
    constructor (public fooMix: string) {

    }
}


const Mix = Class.mixin(FooShared, FooMix);
export class FooClass extends Mix {
    @Class.deco.memoize
    method () {

    }

    constructor (public fooClass: string) {
        super(fooClass);
    }
}



let f = new FooClass('1');
f.