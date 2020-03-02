UTest({
    'queue' () {
        let fn = Class.deco.queued({ 
            foo () {

            }
         }, 'foo');


         is_(fn, 'Function');
    }
})