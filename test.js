let JSONSql=require('./index');
let data=[ {name:'A C' ,age:30,location:'London',dob:'1930-01-25',info:{married:'Y','total_child':2}},
            {name:'A C' ,age:35,location:'London',dob:'1930-01-26',info:{married:'N','total_child':3}},
            {name:'A B' ,age:36,location:'London',dob:'1930-01-27',info:{married:'Y','total_child':4}},
            {name:'A A' ,age:15,location:'Paris',dob:'1998-08-23',info:{married:'Y','total_child':2}},
            {name:'A B' ,age:16,location:'Paris',dob:'1998-08-23',info:{married:'Y','total_child':2}},
            {name:'A C' ,age:17,location:'Kathmandu',dob:'2000-03-23',info:{married:'Y','total_child':2}},
            {name:'A A' ,age:15,location:'Paris',dob:'1998-07-01',info:{married:'Y','total_child':2}},
            {name:'A B' ,age:16,location:'Paris',dob:'1998-07-26',info:{married:'N','total_child':0}},
            {name:'A C' ,age:17,location:'Paris',dob:'1998-07-20',info:{married:'N','total_child':3}},
            {name:'A A' ,age:20,location:'Paris',dob:'1998-07-24',info:{married:'Y','total_child':2}},
            {name:'B A' ,age:15,location:'Kathmandu',dob:'1998-08-23',info:{married:'Y','total_child':2}},
            {name:'B A' ,age:16,location:'Kathmandu',dob:'1998-08-23',info:{married:'N','total_child':0}},
            {name:'B C' ,age:15,location:'Kathmandu',dob:'1998-08-23',info:{married:'N','total_child':2}},

        ];


 let objUtil=new JSONSql();
 //console.log(objUtil.getHaving('xml(name)'));
 //let search_data=objUtil.select('name as full_name.age,count(info.age.name) as age');

console.log('=============');
 let search_data=objUtil.select('name,location as ln,dob,info.married')
 .from(data)
 .where('info.married','=','Y')
 .where('location','like','london')
 .orderby('name asc')
 .fetch();
 console.log(search_data);


console.log('=============');
search_data=objUtil.select('name,count(name) as cnt_name,avg(age) as avg_age,min(age),max(age)')
    .from(data)
    .having('cnt_name','>','2')
    .orderby('min_age desc')
    .fetch();
console.log(search_data);

console.log('=============');
search_data=objUtil.select('name,location,count(name) as cnt_name,avg(age) as avg_age')
    .from(data)
    .where('location','=','kathmandu')
    .fetch();

console.log(search_data);
