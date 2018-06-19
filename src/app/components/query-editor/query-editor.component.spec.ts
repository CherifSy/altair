import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormsModule } from '@angular/forms';
import { CodemirrorModule } from 'ng2-codemirror';

import { QueryEditorComponent } from './query-editor.component';
import { FlexResizerComponent } from '../flex-resizer/flex-resizer.component';

describe('QueryEditorComponent', () => {
  let component: QueryEditorComponent;
  let fixture: ComponentFixture<QueryEditorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QueryEditorComponent, FlexResizerComponent ],
      imports: [
        FormsModule,
        CodemirrorModule,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QueryEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
