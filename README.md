# JSONSql
Access JSON via sql like syntax. This is my real timesaver
 when I am building reporting SPA application.

## install
```
$npm install easyjsonsql
```
#### Available method on select
min,max,avg,count

#### Available operator on where
>, < ,>= ,<= ,like

#### Having clause
having use alias on min,max,avg,count and operater availables are >, < ,>= ,<=  


## Usage

* Sample json array dataset
```

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
```

* Include the module
```
let JSONSql=require('./JSONSql');
let objUtil=new JSONSql();
```

 
 ####  Query Sample 1 
 
```  
 let search_data=objUtil.select('name,location as ln,dob,info.married')
 .from(data)
 .where('info.married','=','Y')
 .where('location','like','london')
 .fetch();
 console.log(search_data);
```
You will have output of :
```
[ { name: 'A C',
    location: 'London',
    dob: '1930-01-25',
    info: { married: 'Y', total_child: 2 } },
  { name: 'A B',
    location: 'London',
    dob: '1930-01-27',
    info: { married: 'Y', total_child: 4 } } ]

```
####  Query Sample 2
```
search_data=objUtil.select('name,count(name) as cnt_name,avg(age) as avg_age')
    .from(data)
    .having('cnt_name','>','2')
    .having('avg_age','>','15')
    .fetch();
console.log(search_data);
```
You will have output of :
```
[ { name: 'A C', age: 30, cnt_name: 4, avg_age: 24.75 },
  { name: 'A B', age: 36, cnt_name: 3, avg_age: 22.666666666666668 },
  { name: 'A A', age: 15, cnt_name: 3, avg_age: 16.666666666666668 } ]

```
### Query Sample 3
```
search_data=objUtil.select('name,location,count(name) as cnt_name,avg(age) as avg_age')
    .from(data)
    .where('location','=','kathmandu')
    .fetch();

console.log(search_data);

```
You will have output of :
```
[ { name: 'A C',
    location: 'Kathmandu',
    age: 17,
    cnt_name: 1,
    avg_age: 17 },
  { name: 'B A',
    location: 'Kathmandu',
    age: 15,
    cnt_name: 2,
    avg_age: 15.5 },
  { name: 'B C',
    location: 'Kathmandu',
    age: 15,
    cnt_name: 1,
    avg_age: 15 } ]

```





## Good Luck