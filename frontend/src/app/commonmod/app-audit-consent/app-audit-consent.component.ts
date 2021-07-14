import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray, NgForm, NgControl, Form } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorSummaryService } from '@app/helpers/errorsummary.service';
import { BrandService } from '@app/services/master/brand/brand.service';

@Component({
  selector: 'app-app-audit-consent',
  templateUrl: './app-audit-consent.component.html',
  styleUrls: ['./app-audit-consent.component.scss']
})
export class AppAuditConsentComponent implements OnInit {
  @Input() unit_id: any;
  @Input() unit_type: any;
  @Input() app_id: any;
  @Input() tc_request_id:any;
  

  loading: any = [];
  formData: FormData = new FormData();

  auditconsentForm: FormGroup;
  brandlist: any = [];
  success: any;
  error: any;

  sel_brand_ch: any;
  brand_id: any;
  btnLabel: string = 'Save';
  data: any;
  brlist: any = [];
  rad_label: string;
  constructor(public router: Router,private fb: FormBuilder, public errorSummary: ErrorSummaryService, public brandService: BrandService) { }

  ngOnInit() {

    if(this.tc_request_id){
      this.rad_label = 'Do you want to share TC detail to brand?';
    }
    else{
      this.rad_label ="Do you want to share Audit details to brand?"
      console.log(this.tc_request_id);
    }
    this.brandService.getBrand({ id: this.app_id, type: 'consent' }).subscribe(res => {
      this.brandlist = res.data;
    })
    this.auditconsentForm = this.fb.group({

      sel_brand_ch: ['', [Validators.required]],
      brand_id: ['', [Validators.required]],
      brand_file: [''],

    })

    this.brandService.getBrandConsentDetails({ app_id: this.app_id, unit_id: this.unit_id }).subscribe(res => {
      if (res.status) {
        this.data = res.data;
        for (var i = 0; i < this.data.length; i++) {
          this.brlist[i] = this.data[i].brand_id;
        }

        this.auditconsentForm.patchValue({
          sel_brand_ch: res.sel_brand_ch ? res.sel_brand_ch : "2",

        })

        this.brand_file = res.brand_file;


        this.btnLabel = 'Update';
      }
    })
  }
  get f() { return this.auditconsentForm.controls; }

  getSelectedValue(type, val) {

    if (type = 'brand_id') {
      return this.brandlist.find(x => x.id == val).brand_name;
    }
  }
  brand_file = '';
  brandFileError = '';
  removebrandFile() {
    this.brand_file = '';
    this.formData.delete('brand_file');
  }

  brandfileChange(element) {
    let files = element.target.files;
    this.brandFileError = '';
    let fileextension = files[0].name.split('.').pop();
    if (this.errorSummary.checkValidDocs(fileextension)) {

      this.formData.append("brand_file", files[0], files[0].name);
      this.brand_file = files[0].name;

    } else {
      this.brandFileError = 'Please upload valid file';
    }
    element.target.value = '';

  }

  brandtouched() {
    this.f.brand_id.markAsTouched();
    this.f.sel_brand_ch.markAsTouched();
  }

  onSubmit() {

    let formerror = false;
    if (this.f.sel_brand_ch.value == 1) {
      this.brandtouched();

      if (this.f.brand_id.value == '') {
        formerror = true;
      }
      if ((this.brand_file == '' && this.unit_type == 3) || (this.unit_type==3 && this.brand_file==null)) {
        this.brandFileError = 'Please upload brand file';
        formerror = true;
      }

    }
    else if (this.f.sel_brand_ch.value == '') {
      formerror = true;
    }


    if (!formerror) {
      this.loading['button'] = true;
      console.log(this.auditconsentForm.value);
      let formvalue: any = {};
      let sel_brand_ch = this.f.sel_brand_ch.value;
      let brand_id = this.f.brand_id.value;

      formvalue.sel_brand_ch = sel_brand_ch;
      formvalue.brand_id = brand_id;
      formvalue.app_id = this.app_id;
      formvalue.unit_id = this.unit_id;

      this.formData.append('formvalues', JSON.stringify(formvalue));

      this.brandService.brandConsent(this.formData).subscribe(res => {
        if (res.status) {
          this.success = { summary: res.message };
          this.loading['button'] = false;
          this.btnLabel = 'Update';

          this.formData = new FormData();
          this.brand_file = '';
          this.router.navigateByUrl('/audit/list-audit-plan');
        }
        else {
          this.error = { summary: res.message };
          this.loading['button'] = false;
        }
      })
    }

  }
}
