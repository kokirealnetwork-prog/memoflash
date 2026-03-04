export interface Card {
  id: string;
  question: string;
  answer: string;
}

export enum AppMode {
  EDIT = 'EDIT',
  STUDY = 'STUDY'
}
