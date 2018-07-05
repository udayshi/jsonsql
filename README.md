# JSONSql
Access JSON via sql like syntax. This is my real timesaver
 when I am building reporting SPA application.

## install
```
$npm install json-sql-tool
```
#### Available method on select aggregation
min,max,avg,count,sum

#### Available operator on where
like, > , < ,>= ,<= 

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
let JSONSql=require('json-sql-tool');
let objUtil=new JSONSql();
```

 
####  Query Sample select with where and order by 
On this sample we select the column and filter by using where and order by field [asc|desc]
 
```  
 let search_data=objUtil.select('name,location as ln,dob,info.married')
 .from(data)
 .where('info.married','=','Y')
 .where('location','like','london')
 .orderby('name asc')
 .fetch();
 console.log(search_data);
```
You will have output of :
```
[ { name: 'A B', location: 'London',  dob: '1930-01-27',  info: { married: 'Y', total_child: 4 } },
  { name: 'A C', location: 'London',  dob: '1930-01-25',  info: { married: 'Y', total_child: 2 } } ]


```
NOTE: Currently order by only detect integer and string. I am planning to order based date as well.

####  Query Sample 2 for aggregation (group by) and filter having
In this sample we have use count(),avg(),min(),max()  aggregation method.
Once we use aggregation method it will automatically group the result on selected field.

We have also used having filter on this sample. This will first create the result and then
 filter based on having filter. 
 
 and order the final result based on minimum age .
 
 NOTE: Currently order by only detect integer and string. I am planning to order based date as well.
 

```
search_data=objUtil.select('name,count(name) as cnt_name,avg(age) as avg_age,min(age),max(age)')
    .from(data)
    .having('cnt_name','>','2')
    .orderby('min_age desc')
    .fetch();
console.log(search_data);
```
You will have output of :
```
[ { name: 'A C',  age: 30,  cnt_name: 4,  avg_age: 24.75,  min_age: 17,  max_age: 35 },
  { name: 'A B',  age: 36,  cnt_name: 3,  avg_age: 22.666666666666668,   min_age: 16, max_age: 36 },
  { name: 'A A',  age: 15,  cnt_name: 3,  avg_age: 16.666666666666668,   min_age: 15, max_age: 20 } 
 ]
```



NOTE: Currently order by only detect integer and string. I am planning to order based date as well.


## Good Luck