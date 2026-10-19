import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { students, attendance } = body;

    // 1. Lưu bản sao dữ liệu (backup data) vào mã nguồn để đồng bộ lên GitHub
    if (students || attendance) {
      const dataDir = path.join(process.cwd(), 'src', 'data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const backupPath = path.join(dataDir, 'database-backup.json');
      fs.writeFileSync(
        backupPath,
        JSON.stringify(
          {
            updatedAt: new Date().toISOString(),
            totalStudents: students?.length || 0,
            totalAttendance: attendance?.length || 0,
            students: students || [],
            attendance: attendance || [],
          },
          null,
          2
        ),
        'utf-8'
      );
    }

    const timestamp = new Date().toLocaleString('vi-VN');

    // 2. Chạy lệnh git add
    await execAsync('git add .');

    // 3. Chạy lệnh git commit
    try {
      await execAsync(`git commit -m "auto: dong bo du lieu va ma nguon - ${timestamp}"`);
    } catch (err: unknown) {
      // Nếu không có thay đổi nào mới thì bỏ qua lỗi "nothing to commit"
      const errStr = String(err);
      if (!errStr.includes('nothing to commit') && !errStr.includes('clean')) {
        console.warn('Git commit note:', errStr);
      }
    }

    // 4. Chạy lệnh git push lên branch main
    const { stdout: pushOutput } = await execAsync('git push origin main');

    return NextResponse.json({
      success: true,
      message: 'Đã tự động đẩy mã nguồn và dữ liệu lên GitHub thành công!',
      timestamp,
      details: pushOutput || 'Push thành công nhánh main',
    });
  } catch (error: unknown) {
    console.error('Git sync error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);

    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi khi đồng bộ lên GitHub: ' + errorMessage,
        hint: 'Hãy đảm bảo máy tính có kết nối mạng và tài khoản Git đã được đăng nhập quyền push.',
      },
      { status: 500 }
    );
  }
}
