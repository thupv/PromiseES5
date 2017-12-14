var p1 = new Promise(function(resolve, reject){
  setTimeout(function(){
    resolve();
  }, 2000);
});
p1.then(function(){
  console.log(".then() working");
}).then(function(){
  console.log("chain working");
});

var p2 = new Promise(function(resolve, reject){
  setTimeout(function(){
    reject();
  }, 2000);
});
p2.then(function(){

}, function(){
  console.log("then reject working");
  return;
});

p2.then(function(){
  console.log("then working");
}).catch(function(){
  console.log("catch working");
});