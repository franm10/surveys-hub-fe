import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
    featureList = [
        {
            icon: 'auto_graph',
            title: 'Statistiche Live',
            text:  'Vedi i risultati in tempo reale, senza ricaricare la pagina.'
        },
        {
            icon: 'security',
            title: 'Sicurezza & Privacy',
            text:  'Autenticazione Google e crittografia dei dati su Firebase.'
        },
        {
            icon: 'design_services',
            title: 'Editor Semplice',
            text:  'Carica JSON o crea domande direttamente da interfaccia.'
        },
        {
            icon: 'public',
            title: 'Condivisione Smart',
            text:  'Link unici, codici o inviti e-mail con approvazione opzionale.'
        },
        {
            icon: 'image',
            title: 'Domande Multimediali',
            text:  'Arricchisci le tue survey con immagini per un coinvolgimento maggiore.'
        }
    ];

}
