import { Component, OnInit,EventEmitter,QueryList, ViewChildren } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl,FormArray } from '@angular/forms';
import { ActivatedRoute ,Params, Router } from '@angular/router';
import { GotsCertifiedClientService } from '@app/services/report/gots-certified-client.service';
import { AuthenticationService } from '@app/services/authentication.service';
import { first } from 'rxjs/operators';
import {Observable} from 'rxjs';
import {saveAs} from 'file-saver';
import {NgbModal, ModalDismissReasons, NgbModalOptions} from '@ng-bootstrap/ng-bootstrap';
import { ErrorSummaryService } from '@app/helpers/errorsummary.service';
import { Standard } from '@app/services/standard';
import { User } from '@app/models/master/user';
import { StandardService } from '@app/services/standard.service';
import { UserService } from '@app/services/master/user/user.service';

@Component({
  selector: 'app-gots-certified-client',
  templateUrl: './gots-certified-client.component.html',
  styleUrls: ['./gots-certified-client.component.scss']
})
export class GotsCertifiedClientComponent implements OnInit {

  title = 'Yearly Certified Client';	
  form : FormGroup;
  loading = false;
  buttonDisable = false;
  maxDate = new Date();
  error:any;
  success:any;
  data:any=[];

  standardList:Standard[];
  franchiseList:User[];
  yearList:any = [];
  modalss:any;

  userType:number;
  userdetails:any;
  userdecoded:any;


  constructor(private modalService: NgbModal, private userservice: UserService,private router: Router,private fb:FormBuilder,private standardservice: StandardService, private authservice:AuthenticationService,private errorSummary: ErrorSummaryService,public service: GotsCertifiedClientService) { }

  ngOnInit() {
    this.form = this.fb.group({
      standard_id:['',[Validators.required]],
      oss_id:[''],
      year_id:['',[Validators.required]]
    });

    this.service.getMonthYear({type:'standardmonth'}).subscribe(res=>{
      this.yearList = res.years;
    });

    this.standardservice.getStandard().subscribe(res => {
      this.standardList = res['standards'];     
    });

    this.userservice.getAllUser({type:3}).pipe(first())
    .subscribe(res => {
      this.franchiseList = res.users;
    });   

    this.authservice.currentUser.subscribe(x => {
			if(x){
				let user = this.authservice.getDecodeToken();
				this.userType= user.decodedToken.user_type;
				this.userdetails= user.decodedToken;
			}else{
				this.userdecoded=null;
			}
		});
  }

  get f() { return this.form.controls; } 

  openmodal(content,arg='') {
    this.modalss = this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title',centered: true});
  }

  getSelectedstdValue(val)
  {
    return this.standardList.find(x=> x.id==val).code;    
  }

  getSelectedFranchiseValue(val)
  {
    return this.franchiseList.find(x=> x.id==val).osp_details;    
  }
  
  onchangeHandler()
  {
    this.data=[];
  }

  
  fieldErrors:any;
  from_dateErr:any;
  year_idErr:any;
  onSubmit(type,filename='')
  {
    this.f.year_id.markAsTouched();
    this.f.standard_id.markAsTouched();
    this.f.oss_id.markAsTouched();

    this.fieldErrors='';
    this.year_idErr='';
    
    // let from_date = this.form.get('from_date').value;
    // let to_date = this.form.get('to_date').value;
    let year_id = this.form.get('year_id').value;
    let standard_id = this.form.get('standard_id').value;
    let oss_id = this.form.get('oss_id').value;
  
    
    

    if (this.form.valid) 
    {
      
      let expobject:any={year_id:year_id,standard_id:standard_id,oss_id:oss_id,type:type};
      if(1)
      {
        if(type=='submit')
        {
          this.data=[];
          this.loading = true;
          this.service.getData(expobject)
          .pipe(first())
          .subscribe(res => {        
              if(res.status){
                this.data = res.applications;
                this.buttonDisable = false;
              }else if(res.status == 0){
                this.error = {summary:res};
              }
              this.loading = false;
              this.buttonDisable = false;
          },
          error => {
              this.error = {summary:error};
              this.loading = false;
              this.buttonDisable = false;
          });
        }
        else
        {
          this.service.downloadFile(expobject)
          .pipe(first())
          .subscribe(res => {        
            this.modalss.close();
            let fileextension = filename.split('.').pop(); 
            let contenttype = this.errorSummary.getContentType(filename);
            saveAs(new Blob([res],{type:contenttype}),filename);
          },
          error => {
              this.error = {summary:error};
          });
        }
        
        
      } else {
        
        this.error = {summary:this.errorSummary.errorSummaryText};
        //this.errorSummary.validateAllFormFields(this.form); 
        
      }   
    }
    
  }




}
