var names = ['Ahmed', 'Elselly'];

function name(){
    var persons = []
    for(var i = 0; i < names.length; i++){
        persons.push(names[i]);
    }
    return persons;

}

name();