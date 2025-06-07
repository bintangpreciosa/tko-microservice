// src/common/scalars/datetime.scalar.ts
import { Scalar, CustomScalar } from '@nestjs/graphql';
import { Kind, ValueNode } from 'graphql';

@Scalar('DateTime', () => Date)
export class DateTimeScalar implements CustomScalar<string, Date> {
  description = 'DateTime custom scalar type from ISO 8601 string';

  // `parseValue` dipanggil ketika variabel GraphQL diterima dari klien.
  // Mengubah string (misalnya "2023-10-27T10:00:00Z") menjadi objek Date.
  parseValue(value: string): Date {
    if (typeof value === 'string') {
      const date = new Date(value);
      // Validasi tambahan: Pastikan Date yang dihasilkan valid
      if (!isNaN(date.getTime())) {
        return date;
      }
      throw new Error(`Invalid DateTime value: ${value}`); // Buang error jika string tanggal tidak valid
    }
    // Buang error jika nilai yang diterima bukan string
    throw new Error('DateTime scalar can only parse string values.');
  }

  // `serialize` dipanggil ketika nilai dikirim dari server ke klien.
  // Mengubah objek Date menjadi string ISO 8601.
  serialize(value: Date): string {
    if (value instanceof Date && !isNaN(value.getTime())) {
      return value.toISOString();
    }
    // Buang error jika nilai yang akan diserialisasi bukan objek Date yang valid
    throw new Error('DateTime scalar can only serialize valid Date objects.');
  }

  // `parseLiteral` dipanggil ketika nilai datetime disertakan langsung dalam query string
  // (bukan sebagai variabel).
  parseLiteral(ast: ValueNode): Date {
    if (ast.kind === Kind.STRING) {
      const date = new Date(ast.value);
      // Validasi tambahan: Pastikan Date yang dihasilkan valid
      if (!isNaN(date.getTime())) {
        return date;
      }
      throw new Error(`Invalid DateTime literal: ${ast.value}`); // Buang error jika string literal tidak valid
    }
    // Buang error jika literal yang diterima bukan string
    throw new Error('DateTime scalar can only parse string literals.');
  }
}