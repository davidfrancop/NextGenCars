// src/graphql/queries/getClients.ts

import { gql } from "@apollo/client"

export const GET_CLIENTS = gql`
  query GetClients($type: ClientType) {
    clients(type: $type) {
      client_id
      type
      # PERSONAL
      first_name
      last_name
      # COMPANY
      company_name
      vat_number
      contact_person
      # Compartidos
      email
      phone
      dni
      address
      country
      city
      postal_code
      created_at
      updated_at

      vehicles {
        vehicle_id
        make
        model
        year
        license_plate
      }
    }
  }
`

// Compat opcional (si aún llamas a personalClients en alguna parte)
export const GET_PERSONAL_CLIENTS = gql`
  query GetPersonalClients {
    personalClients {
      client_id
      type
      first_name
      last_name
      email
      phone
      country
      created_at
    }
  }
`

// Útil para EditClient
export const GET_CLIENT_BY_ID = gql`
  query GetClient($client_id: Int!) {
    client(client_id: $client_id) {
      client_id
      type
      # PERSONAL
      first_name
      last_name
      # COMPANY
      company_name
      vat_number
      contact_person
      # Compartidos
      email
      phone
      dni
      address
      country
      city
      postal_code
      created_at
      updated_at
    }
  }
`
