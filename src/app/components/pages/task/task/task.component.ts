import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PatrolCreationService } from '../../../services/patrol-creation/patrol-creation.service';
import { CommonModule } from '@angular/common';
import { AlertService } from '../../../services/alert/alert.service';
import { FormsModule } from '@angular/forms';
import { error } from 'console';

@Component({
  selector: 'app-task',
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css'
})
export class TaskComponent implements OnInit {

  constructor(private patrolService: PatrolCreationService, private alertService: AlertService) { }

  createdBy: string = '';

  ngOnInit(): void {
    const currentAdminId = localStorage.getItem('userId');
    console.log('Logged-in User ID:', currentAdminId);
    this.createdBy = currentAdminId || '';
    this.loadTask();
  }


  reloadPage() {
    window.location.reload();
  }


  tasks: any[] = [];

  loadTask() {
    this.patrolService.getTask().subscribe({
      next: (res: any) => {
        this.tasks = res.checklists;
      },
      error: () => {
        console.log("error loading task")
      }
    })

  }

  createTaskPopup: boolean = false;

  createTask: any = {
    title: '',
    remarks: '',
    createdBy: this.createdBy
  }

  openCreateTask() {
    this.createTaskPopup = true;
    this.createTask.title = '',
      this.createTask.remarks = ''
  }

  closeCreateTask() {
    this.createTaskPopup = false;
  }

  createNewTask() {
    this.createTask.createdBy = this.createdBy;
    this.patrolService.createTask(this.createTask).subscribe({
      next: (res: any) => {
        this.alertService.showAlert(res.message);
        this.closeCreateTask();
        this.loadTask();
      },
      error: () => {
        this.alertService.showAlert("error creating task")

      }
    })
  }

  updateTaskPopup: boolean = false;
  taskIdToUpdate = '';


  openUpdateTask(taskData: any) {
    this.updateTaskPopup = true;
    this.createTask.title = taskData.title;
    this.createTask.remarks = taskData.remarks;
    this.taskIdToUpdate = taskData.checklistId;
  }
  closeUpdateTask() {
    this.updateTaskPopup = false;
  }

updateTask() {
  this.createTask.createdBy = this.createdBy;

  this.patrolService.updateTask(this.taskIdToUpdate, this.createTask).subscribe({
    next: (res: any) => {
      this.alertService.showAlert(res.message);
      this.closeUpdateTask();
      this.loadTask();
    },
    error: () => {
      this.alertService.showAlert("error updating task", 'error');
    }
  });
}

deleteTaskPopup:boolean=false;
taskIdToDelete='';

opendeleteTask(task:any){
  this.deleteTaskPopup=true;
  this.taskIdToDelete=task.checklistId;
}

closeDeleteTask(){
  this.deleteTaskPopup=false;
}

deleteTask(){
  this.patrolService.deleteTask(this.taskIdToDelete).subscribe({
    next:(res:any)=>{
      this.alertService.showAlert(res.message);
      this.closeDeleteTask();
      this.loadTask();
    },
    error:()=>{
          this.alertService.showAlert("error deleting task","error");
    }
  })

}

}
