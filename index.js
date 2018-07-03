/**
 * Access JSON via sql like syntax.
 *
 * @author Uday Shiwakoti < shiuday@gmail.com
 * @date 2018/05/15
 */
class JSONSql{
    /**
     * reset the instance.
     */
    reset(){
        this._data=[];       
        this._columns=[];
        this._pickcol=[];
        this._aggcol=[];
        this._where=[];
        this._order=[];
        this._having=[];
        this._must_fields=new Set();
 
    }




    constructor() {
        this.reset();
    }

    /**
     * Parse the field.
     * @param field
     * @returns {{method: string, field_name: string, alias_name: string}}
     */

    getField(field) {
        field = field.trim();
        let method_alias_regx = field.match(/^(\w+)\((.{1,})\) as (\w+)/i);
        let method_regx = field.match(/^(\w+)\((.{1,})\)/i);
        let alias_regex = field.match(/^(\w+) as (.{1,})/i);
        let output = {method: '', field_name: '', alias_name: ''}
        if (method_alias_regx !== null) {
            output.method = method_alias_regx[1].toLowerCase();
            output.field_name = method_alias_regx[2];
            output.alias_name = method_alias_regx[3];
        } else if (method_regx !== null) {
            output.method = method_regx[1].toLowerCase();
            output.field_name = method_regx[2];
            output.alias_name = output.method+'_'+method_regx[2];
        } else if (alias_regex !== null) {
            output.field_name = alias_regex[1];
            output.alias_name = alias_regex[2];
        } else {
            output.field_name = field;
            output.alias_name = field;
        }

        return output;

    }


    /**
     * Providing the fields which we want to select
     * @param fields
     * @returns {USUtil}
     */

    select(fields) {
        this.reset();
        if (fields == '*')
            this._columns = '*';
        else {

            this._columns = fields.split(',').map((field) => {
                    return this.getField(field);
        })
            ;

        }

        return this;
    }

    /**
     * Providing the json dataset
     * @param data
     * @returns {USUtil}
     */

    from(data) {
        this._data = data;
        return this;
    }

    /**
     * Providing the condition for the given sets
     *
     * @param k
     * @param oper
     * @param v
     * @returns {USUtil}
     */

    where(k,oper,v){
        this._where.push({field_name:k,oper:oper,v:v});

        return this;
    }

    /**
     * Providing the condition for the given sets
     *
     * @param k
     * @param oper
     * @param v
     * @returns {USUtil}
     */

    having(k,oper,v){
        this._having.push({field_name:k,oper:oper,v:v});

        return this;
    }

    /**
     * Ordering the filtered dataset
     * @param field
     * @returns {USUtil}
     */
    orderby(field){
        let order=field.split(',')
        order.forEach(r=>{
            let tmp=r.split(' ');
        let type=typeof tmp[1]=='undefined'?'asc':tmp[1].toLowerCase().trim();


        if(type!='asc' && type!='desc')
            type='asc'

        this._order.push({k:tmp[0].trim(),direction:type});
    });

        return this;
    }


    /**
     * ordering the dataset
     * @returns this
     * @private
     */

    _setOrderBy(){
        let data=this._data;
        if(this._order.length>0){
            data=data.sort((r_a,r_b)=>{

                    for(let i=0;i<this._order.length;i++)
            {
                let order=this._order[i];
                let or_a = r_a[order.k];
                let or_b = r_b[order.k];
                if (or_a == '')
                    or_a = '';
                if (or_b == '')
                    or_b = '';
                if (or_a > 0) {
                    //int
                } else {
                    or_a = or_a.toString().toLowerCase();
                    or_b = or_b.toString().toLowerCase();
                }
                if (order.direction == 'desc') {
                    return or_a < or_b;
                } else {
                    return or_a > or_b;
                }
            }


        })
        }
        this._data=data;
        // console.log('Order By : ',this.data,'\n-----------------')
        return this;

    }

    /**
     * Filter the dataset based on where condition.
     * @returns void
     * @private
     */
    _setFilterData(){
        let output=this._data;

        if(this._where.length>0) {
            output = output.filter(row => {
                    let total_found=0;
            this._where.forEach(cond => {
                let cv=cond.v;


            let rv=this.getStructData(cond.field_name,row).val;

            if(rv=='')
                rv='';
            if(cv=='')
                cv='';

            if(cond.oper=='=' || cond.oper=='like'){
                cv=cv.trim().toUpperCase();
                rv=rv.trim().toUpperCase();
            }if(cond.oper=='<' ||cond.oper=='>' || cond.oper=='>=' ||cond.oper=='<='){
                cv=isNaN(parseFloat(cv))?0:parseFloat(cv);
                rv=isNaN(parseFloat(rv))?0:parseFloat(rv);
            }
            if(cond.oper=='=' && cv==rv)
                total_found++;
            else if(cond.oper=='<' && rv<cv)
                total_found++;
            else if(cond.oper=='>' && rv>cv)
                total_found++;
            else if(cond.oper=='>=' && rv>=cv)
                total_found++;
            else if(cond.oper=='<=' && rv<=cv)
                total_found++;
            else if(cond.oper=='like' && rv.search(cv)>=0){
                total_found++;
            }

        });
            return total_found==this._where.length;
        });




            this._data=output;
        }
    }

    /**
     * Set the selected field for subset return
     * @private
     */

    _setMustFields(){
        if(this._columns!='*'){
            this._columns.forEach(r=>{
                this._must_fields.add(r.field_name);
        });

            this._where.forEach(r=>{
                this._must_fields.add(r.field_name);
        });
            this._having.forEach(r=>{
                this._must_fields.add(r.field_name);
        });
            //this._must_fields=Array.from(this._must_fields);
            this._must_fields=[...this._must_fields];
        }



    }

    /**
     * getting the datastructure of the selected field.
     * @param k
     * @param data
     * @returns {{struct: {}, val: {}}}
     */
    getStructData(k,data){
        let tmp=k.split('.');
        let output={};
        let current_value ={}

        if(data.hasOwnProperty(tmp[0])){
            output[tmp[0]] = data[tmp[0]];
            current_value = output[tmp[0]];
        }

        if(tmp.length>1 && typeof current_value=='object' && current_value.hasOwnProperty(tmp[1])){
            let lvl_1_key=tmp[1];
            output[tmp[0]][lvl_1_key]=current_value[lvl_1_key];
            current_value=current_value[lvl_1_key];

            if(tmp.length>2 && typeof current_value=='object' && current_value.hasOwnProperty(tmp[2])){
                let  lvl_2_key=tmp[2];
                output[tmp[0]][lvl_1_key][lvl_2_key]=current_value[lvl_2_key];
                current_value=current_value[lvl_2_key];
                //console.log('IN 2');
                if(tmp.length>3 && typeof current_value=='object' && current_value.hasOwnProperty(tmp[3])){
                    let lvl_3_key=tmp[3];
                    output[tmp[0]][lvl_1_key][lvl_2_key][lvl_3_key]=current_value[lvl_3_key];
                    current_value=current_value[lvl_3_key];
                    //console.log('IN 3');
                    if(tmp.length>4 && typeof current_value=='object' && current_value.hasOwnProperty(tmp[4])){
                        let lvl_4_key=tmp[4];
                        output[tmp[0]][lvl_1_key][lvl_2_key][lvl_3_key][lvl_4_key]=current_value[lvl_4_key];
                        current_value=current_value[lvl_4_key];

                        //console.log('IN 4');
                        if(tmp.length>5 && typeof current_value=='object' && current_value.hasOwnProperty(tmp[5])){
                            let lvl_5_key=tmp[5];
                            output[tmp[0]][lvl_1_key][lvl_2_key][lvl_3_key][lvl_4_key][lvl_5_key]=current_value[lvl_5_key];
                            //console.log('IN 5');
                        }

                    }


                }

            }
        }
        return {struct:output,val:current_value};
    }

    /**
     * Picking only selected column.
     * @private
     */
    _pickSelectedColumn(){
        let output=[];
        let uniq_cols_obj={};
        this._columns.forEach(col=>{
            let tmp=col.field_name.split('.');
                uniq_cols_obj[tmp[0]]=true;
        });
        let uniq_cols=[];
        for(let col in uniq_cols_obj){
            uniq_cols.push(col);
        }
        this._data.forEach(row=>{
            let selected_row={};
        uniq_cols.forEach(col=>{
            selected_row[col]=row[col];
        });
        output.push(selected_row);
    });
     this._data=output;
    }
    _aggregate(){
        let output={}
        this._columns.forEach(ck=>{
            if(ck.method==''){
            this._pickcol.push(ck);
            }else{
                this._aggcol.push(ck);
            }
        });

        this._data.forEach(row=>{
                    let k='';
                this._pickcol.forEach(ck=>{
                        k+=row[ck.field_name];
                    });
                if(!output.hasOwnProperty(k)){
                    output[k]=row;
                }



                this._aggcol.forEach(ck=>{
                    if(!output[k].hasOwnProperty(ck.alias_name))
                        output[k][ck.alias_name]=[];
                    output[k][ck.alias_name].push(row[ck.field_name]);

            });

    });



        this._data=[];

        for(let row_k in output){
            let row=output[row_k];
            this._aggcol.forEach(ck=>{
                let ag_k=ck.alias_name;
            if(ck.method=='max'){
                row[ag_k]=Math.max(...row[ag_k]);
            }else if(ck.method=='min'){
                row[ag_k]=Math.min(...row[ag_k]);
            }else if(ck.method=='count'){
                row[ag_k]=row[ag_k].length;
            }else if(ck.method=='sum'){
                row[ag_k]=row[ag_k].reduce((a,b)=>a+b,0);
            }else if(ck.method=='avg'){
                row[ag_k]=row[ag_k].reduce((a,b)=>a+b,0)/row[ag_k].length;
            }else{
                row[ag_k]=0;
            }
        });
            this._data.push(row);
        }


    }

    /**
     * Filter dataset after aggration function.
     * @returns {boolean}
     * @private
     */
    _havingFilter(){
        if(this._having.length>0){
            let total_search=this._having.length;
            this._data=this._data.filter(r=>{
                    let found_count=0;
                    this._having.forEach(cond=>{
                            if(cond.oper=='>' && r[cond.field_name] > cond.v)
                                found_count++;
                            else if(cond.oper=='<' && r[cond.field_name] < cond.v)
                                found_count++;
                            else if(cond.oper=='>=' && r[cond.field_name] >= cond.v)
                                found_count++;
                            else if(cond.oper=='<=' && r[cond.field_name] <= cond.v)
                                found_count++;

                    });
                    return total_search==found_count;
                });
        }

    }
    fetch(){
        this._setMustFields();
        this._setFilterData();
        this._pickSelectedColumn();
        this._aggregate();
        this._havingFilter();
        this._setOrderBy();
        return this._data;
    }



}
module.exports=JSONSql;


