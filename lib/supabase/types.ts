export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; nome: string; is_admin: boolean; criado_em: string }
        Insert: { id: string; nome: string; is_admin?: boolean }
        Update: { nome?: string; is_admin?: boolean }
        Relationships: []
      }
      courses: {
        Row: { id: string; slug: string; titulo: string; descricao: string; preco: number; carga_horaria: number; thumbnail_url: string | null; publicado: boolean; criado_em: string }
        Insert: { slug: string; titulo: string; descricao: string; preco: number; carga_horaria?: number; thumbnail_url?: string; publicado?: boolean }
        Update: { slug?: string; titulo?: string; descricao?: string; preco?: number; carga_horaria?: number; thumbnail_url?: string; publicado?: boolean }
        Relationships: []
      }
      modules: {
        Row: { id: string; course_id: string; titulo: string; ordem: number }
        Insert: { course_id: string; titulo: string; ordem?: number }
        Update: { titulo?: string; ordem?: number }
        Relationships: [{ foreignKeyName: 'modules_course_id_fkey'; columns: ['course_id']; isOneToOne: false; referencedRelation: 'courses'; referencedColumns: ['id'] }]
      }
      lessons: {
        Row: { id: string; module_id: string; titulo: string; video_path: string; duracao_segundos: number; ordem: number }
        Insert: { module_id: string; titulo: string; video_path: string; duracao_segundos?: number; ordem?: number }
        Update: { titulo?: string; video_path?: string; duracao_segundos?: number; ordem?: number }
        Relationships: [{ foreignKeyName: 'lessons_module_id_fkey'; columns: ['module_id']; isOneToOne: false; referencedRelation: 'modules'; referencedColumns: ['id'] }]
      }
      enrollments: {
        Row: { id: string; user_id: string; course_id: string; pago_em: string; metodo_pagamento: string; payment_id: string | null }
        Insert: { user_id: string; course_id: string; metodo_pagamento?: string; payment_id?: string }
        Update: { user_id?: string; course_id?: string; metodo_pagamento?: string; payment_id?: string }
        Relationships: [
          { foreignKeyName: 'enrollments_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'enrollments_course_id_fkey'; columns: ['course_id']; isOneToOne: false; referencedRelation: 'courses'; referencedColumns: ['id'] }
        ]
      }
      lesson_progress: {
        Row: { id: string; user_id: string; lesson_id: string; concluida_em: string }
        Insert: { user_id: string; lesson_id: string }
        Update: { user_id?: string; lesson_id?: string }
        Relationships: [
          { foreignKeyName: 'lesson_progress_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'lesson_progress_lesson_id_fkey'; columns: ['lesson_id']; isOneToOne: false; referencedRelation: 'lessons'; referencedColumns: ['id'] }
        ]
      }
      certificates: {
        Row: { id: string; user_id: string; course_id: string; codigo_validacao: string; gerado_em: string }
        Insert: { user_id: string; course_id: string }
        Update: { user_id?: string; course_id?: string }
        Relationships: [
          { foreignKeyName: 'certificates_user_id_fkey'; columns: ['user_id']; isOneToOne: false; referencedRelation: 'profiles'; referencedColumns: ['id'] },
          { foreignKeyName: 'certificates_course_id_fkey'; columns: ['course_id']; isOneToOne: false; referencedRelation: 'courses'; referencedColumns: ['id'] }
        ]
      }
    }
    Views: Record<never, never>
    Functions: Record<never, never>
    Enums: Record<never, never>
    CompositeTypes: Record<never, never>
  }
}
