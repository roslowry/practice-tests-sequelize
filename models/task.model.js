'use strict';
const Bluebird = require('bluebird')
var db = require('./database');
var Sequelize = require('sequelize');

// Make sure you have `postgres` running!

var Task = db.define('Task', {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  complete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  due: Sequelize.DATE
}, {
  //---------VVVV---------  your code below  ---------VVV----------
  getterMethods: {
  timeRemaining: function () {
    if (!this.due) {
      return Infinity;
    } else {
      return this.due - Date.now();
    }
  },
  overdue: function() {
    if (this.timeRemaining < 0 && (!this.complete)) {
      return true
    } else {
      return false
    }
    }
  },
  instanceMethods: {
    markComplete: function () {
      // console.log('hi form mark complete')
      return this.update({
        complete: true
      })
    },
    addChild: function (info) {


      const nameHere = info.name
      // console.log('namehere we go', name);
      return Task.create({
        name: nameHere,
        parentId: this.id
      })

    },
    getChildren: function () {
      // console.log('this.parentId', this.parentId)
      return Task.findAll({
        include: [{
          model: Task,
          as: 'parent',
          where: {parentId: this.parentId}
        }]
      })
    //   .then(function(inst){
    //     console.log('here it is yoiudflkajsdf;lkasdjf;lkadjf', inst)
    //   })
  },
  getSiblings: function() {
    return Task.findAll({
      where: {
        id: {
          $ne: this.id
        },
        parentId: this.parentId
      }
    // include: [{
    //     model: Task,
    //     as: 'parent',
    //     where: {parentId: this.parentId}
    //   }],
    })
  }
  },
  classMethods: {
    clearCompleted: function() {
      return Task.destroy({
        where: {
          complete: true
        }
      })
    },
    completeAll: function () {
      return this.update(
        {complete: true},
      {where: {complete: false}})
                      // return Task.findAll({
                      //   where: {
                      //     complete: false
                      //   }
                      // })
                      // .then(function(incompleteTasks){
                      //   // console.log('incomplete', incompleteTasks)
                      //   // const taskCompletePromise = incompletTask.update()
                      //   // Promise.all()
                      //   return Promise.all(incompleteTasks.map(aTask => {
                      //     return aTask.markComplete()
                      //   }))
                      // })
    }
  }
});




// Task.hasMany(Task, {as: 'child'});
  //---------^^^---------  your code above  ---------^^^----------


Task.belongsTo(Task, {as: 'parent'});








module.exports = Task;
