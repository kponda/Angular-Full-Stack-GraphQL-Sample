import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { Apollo } from 'apollo-angular';
import { ApolloQueryResult } from 'apollo-client';
import { Observable } from 'rxjs/Observable';
import { QueryRef } from 'apollo-angular/QueryRef';
import gql from 'graphql-tag';

import { ToastComponent } from '../shared/toast/toast.component';
import { Cat } from '../shared/models/cat.model';

const AllCatsQuery = gql`
query {
  cats {
    _id
    name
    age
    weight
  }
}`;

const CatAdd = gql`
mutation CatAdd($name: String!, $age: Int!, $weight: Float!) {
  addCat(name: $name, age: $age, weight: $weight) {
    _id, name, age, weight
  }
}`;

const CatUpdate = gql`
mutation CatUpdate($_id: String!, $name: String!, $age: Int!, $weight: Float!) {
  updateCat(id: $_id, name: $name, age: $age, weight: $weight) {
    _id, name, age, weight
  }
}`;

const CatRemove = gql`
mutation CatRemove($_id: String!) {
  removeCat(id: $_id) {
    _id, name, age, weight
  }
}`;

@Component({
  selector: 'app-cats-graphql',
  templateUrl: './cats-graphql.component.html',
  styleUrls: ['./cats-graphql.component.scss']
})
export class CatsGraphqlComponent implements OnInit {
  cat = new Cat();
  cats: Observable<Cat>;
  catsQueryRef: QueryRef<any>;
  isLoading = true;
  isEditing = false;

  addCatForm: FormGroup;
  name = new FormControl('', Validators.required);
  age = new FormControl('', Validators.required);
  weight = new FormControl('', Validators.required);

  constructor(private apollo: Apollo,
              private formBuilder: FormBuilder,
              public toast: ToastComponent) { }

  ngOnInit() {
    this.getCats();
    this.addCatForm = this.formBuilder.group({
      name: this.name,
      age: this.age,
      weight: this.weight
    });
  }

  getCats() {
    this.catsQueryRef = this.apollo.watchQuery<any>({
      query: AllCatsQuery
    });
    this.catsQueryRef.valueChanges
      .subscribe(({data}) => {
        this.isLoading = data.loading;
        this.cats = data.cats;
      });
  }

  addCat() {
    this.apollo.mutate({
      mutation: CatAdd,
      variables: this.addCatForm.value
    }).subscribe(({ data }) => {
      console.log('got data', data);
      this.catsQueryRef.refetch();
      this.addCatForm.reset();
      this.toast.setMessage('item added successfully.', 'success');
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  enableEditing(cat: Cat) {
    this.isEditing = true;
    // observableで取得したオブジェクトはimmutableになっているのでクローン生成
    this.cat = JSON.parse(JSON.stringify(cat));
  }

  cancelEditing() {
    this.isEditing = false;
    this.cat = new Cat();
    this.toast.setMessage('item editing cancelled.', 'warning');
    // reload the cats to reset the editing
    this.getCats();
  }

  editCat(cat: Cat) {
    this.apollo.mutate({
      mutation: CatUpdate,
      variables: cat
    }).subscribe(({ data }) => {
      console.log('got data', data);
      this.catsQueryRef.refetch();
      this.isEditing = false;
      this.toast.setMessage('item edited successfully.', 'success');
    }, (error) => {
      console.log('there was an error sending the query', error);
    });
  }

  deleteCat(cat: Cat) {
    if (window.confirm('Are you sure you want to permanently delete this item?')) {
      this.apollo.mutate({
        mutation: CatRemove,
        variables: {_id: cat._id}
      }).subscribe(({ data }) => {
        this.toast.setMessage('item deleted successfully.', 'success');
        this.catsQueryRef.refetch();
      }, (error) => {
        console.log('there was an error sending the query', error);
      });
    }
  }

}
