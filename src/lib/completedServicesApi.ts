import { supabase } from './supabase'
import type { CompletedService, PartUsed } from '../types'

export interface CreateServiceData {
  title: string
  description: string
  equipment_type: string
  client_name: string
  location: string
  service_date: string
  completion_date: string
  duration: number
  service_fee: number
  labor_cost: number
  technician: string
  notes?: string
  parts_used: Array<{
    name: string
    quantity: number
    cost: number
  }>
}

// Fetch all completed services with their parts
export async function fetchCompletedServices(): Promise<CompletedService[]> {
  try {
    const { data: services, error } = await supabase
      .from('completed_services')
      .select(`
        *,
        parts_used (*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching services:', error)
      throw error
    }

    return services || []
  } catch (error) {
    console.error('Failed to fetch completed services:', error)
    throw error
  }
}

// Create a new completed service with parts
export async function createCompletedService(serviceData: CreateServiceData): Promise<CompletedService> {
  try {
    // Calculate total cost
    const partsTotal = serviceData.parts_used.reduce((sum, part) => sum + (part.cost * part.quantity), 0)
    const totalCost = partsTotal + serviceData.labor_cost

    // Insert the main service record
    const { data: service, error: serviceError } = await supabase
      .from('completed_services')
      .insert([{
        title: serviceData.title,
        description: serviceData.description,
        equipment_type: serviceData.equipment_type,
        client_name: serviceData.client_name,
        location: serviceData.location,
        service_date: serviceData.service_date,
        completion_date: serviceData.completion_date,
        duration: serviceData.duration,
        service_fee: serviceData.service_fee,
        labor_cost: serviceData.labor_cost,
        total_cost: totalCost,
        technician: serviceData.technician,
        notes: serviceData.notes,
        status: 'completed',
        payment_status: 'pending'
      }])
      .select()
      .single()

    if (serviceError) {
      console.error('Error creating service:', serviceError)
      throw serviceError
    }

    // Insert parts used if any
    if (serviceData.parts_used.length > 0) {
      const partsToInsert = serviceData.parts_used.map(part => ({
        service_id: service.id,
        name: part.name,
        quantity: part.quantity,
        cost: part.cost
      }))

      const { error: partsError } = await supabase
        .from('parts_used')
        .insert(partsToInsert)

      if (partsError) {
        console.error('Error creating parts:', partsError)
        // If parts insertion fails, we might want to rollback the service creation
        // For now, we'll just log the error
      }
    }

    // Fetch the complete service with parts
    const { data: completeService, error: fetchError } = await supabase
      .from('completed_services')
      .select(`
        *,
        parts_used (*)
      `)
      .eq('id', service.id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete service:', fetchError)
      throw fetchError
    }

    return completeService
  } catch (error) {
    console.error('Failed to create completed service:', error)
    throw error
  }
}

// Update a completed service
export async function updateCompletedService(
  id: string, 
  updates: Partial<CompletedService>
): Promise<CompletedService> {
  try {
    const { data: service, error } = await supabase
      .from('completed_services')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        parts_used (*)
      `)
      .single()

    if (error) {
      console.error('Error updating service:', error)
      throw error
    }

    return service
  } catch (error) {
    console.error('Failed to update completed service:', error)
    throw error
  }
}

// Update a completed service with parts
export async function updateCompletedServiceWithParts(
  id: string, 
  serviceData: CreateServiceData
): Promise<CompletedService> {
  try {
    // Calculate total cost
    const partsTotal = serviceData.parts_used.reduce((sum, part) => sum + (part.cost * part.quantity), 0)
    const totalCost = partsTotal + serviceData.labor_cost

    // Update the main service record
    const { data: service, error: serviceError } = await supabase
      .from('completed_services')
      .update({
        title: serviceData.title,
        description: serviceData.description,
        equipment_type: serviceData.equipment_type,
        client_name: serviceData.client_name,
        location: serviceData.location,
        service_date: serviceData.service_date,
        completion_date: serviceData.completion_date,
        duration: serviceData.duration,
        service_fee: serviceData.service_fee,
        labor_cost: serviceData.labor_cost,
        total_cost: totalCost,
        technician: serviceData.technician,
        notes: serviceData.notes
      })
      .eq('id', id)
      .select()
      .single()

    if (serviceError) {
      console.error('Error updating service:', serviceError)
      throw serviceError
    }

    // Delete existing parts
    const { error: deletePartsError } = await supabase
      .from('parts_used')
      .delete()
      .eq('service_id', id)

    if (deletePartsError) {
      console.error('Error deleting existing parts:', deletePartsError)
      throw deletePartsError
    }

    // Insert new parts if any
    if (serviceData.parts_used.length > 0) {
      const partsToInsert = serviceData.parts_used.map(part => ({
        service_id: id,
        name: part.name,
        quantity: part.quantity,
        cost: part.cost
      }))

      const { error: partsError } = await supabase
        .from('parts_used')
        .insert(partsToInsert)

      if (partsError) {
        console.error('Error creating parts:', partsError)
        throw partsError
      }
    }

    // Fetch the complete updated service with parts
    const { data: completeService, error: fetchError } = await supabase
      .from('completed_services')
      .select(`
        *,
        parts_used (*)
      `)
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete service:', fetchError)
      throw fetchError
    }

    return completeService
  } catch (error) {
    console.error('Failed to update completed service with parts:', error)
    throw error
  }
}

// Delete a completed service (parts will be deleted automatically due to CASCADE)
export async function deleteCompletedService(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('completed_services')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting service:', error)
      throw error
    }
  } catch (error) {
    console.error('Failed to delete completed service:', error)
    throw error
  }
}

// Update payment status
export async function updatePaymentStatus(
  id: string, 
  paymentStatus: 'paid' | 'pending' | 'overdue'
): Promise<CompletedService> {
  try {
    const { data: service, error } = await supabase
      .from('completed_services')
      .update({ payment_status: paymentStatus })
      .eq('id', id)
      .select(`
        *,
        parts_used (*)
      `)
      .single()

    if (error) {
      console.error('Error updating payment status:', error)
      throw error
    }

    return service
  } catch (error) {
    console.error('Failed to update payment status:', error)
    throw error
  }
}

// Get service statistics
export async function getServiceStatistics() {
  try {
    const { data: services, error } = await supabase
      .from('completed_services')
      .select('total_cost, payment_status')

    if (error) {
      console.error('Error fetching service statistics:', error)
      throw error
    }

    const totalServices = services?.length || 0
    const totalRevenue = services?.reduce((sum, service) => sum + (service.total_cost || 0), 0) || 0
    const paidServices = services?.filter(service => service.payment_status === 'paid').length || 0
    const pendingPayments = services?.filter(service => service.payment_status !== 'paid').length || 0

    return {
      totalServices,
      totalRevenue,
      paidServices,
      pendingPayments
    }
  } catch (error) {
    console.error('Failed to fetch service statistics:', error)
    throw error
  }
} 