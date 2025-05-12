'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { DialogTitle } from '@radix-ui/react-dialog';

interface Book {
  id: number;
  title: string;
  author: string;
  description: string;
  recommender: string;
  image: string;
}
export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [form, setForm] = useState<Omit<Book, 'id'>>({
    title: '',
    author: '',
    description: '',
    recommender: '',
    image: '',
  });
  function resizeImage(file: File, maxSize = 300): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = () => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const scale = maxSize / Math.max(img.width, img.height);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7)); // 압축률 조정
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}


  // 로컬스토리지에서 불러오기
  useEffect(() => {
    const stored = localStorage.getItem('bookshelf');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setBooks(parsed);
      } catch (e) {
        console.error('로컬스토리지 파싱 오류:', e);
      }
    }
  }, []);

  // 변경되면 저장
  useEffect(() => {
    localStorage.setItem('bookshelf', JSON.stringify(books));
  }, [books]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const resized = await resizeImage(file);
    setForm((prev) => ({ ...prev, image: resized }));
  };


  const handleAddBook = () => {
    if (!form.title.trim() || !form.image) {
      alert('책 제목과 표지를 모두 입력해주세요.');
      return;
    }
    const newBook: Book = { ...form, id: Date.now() };
    setBooks([...books, newBook]);
    setForm({
      title: '',
      author: '',
      description: '',
      recommender: '',
      image: '',
    });
  };

  return (
    <div className="min-h-screen bg-[#f7f3e9] p-8 font-serif">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-[#5e4630]">📚 대전과학고등학교 과학자의 서재</h1>

        {/* 책 추가 버튼 + 입력 모달 */}
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-[#a47551] hover:bg-[#8b5a3e] text-white">
              📕 책 추가하기
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white rounded-xl border p-6 max-w-lg">
            <DialogTitle className="text-xl font-bold mb-4 text-[#5e4630]">
              책 추가하기
            </DialogTitle>
            <div className="grid gap-4">
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {form.image && (
                <img
                  src={form.image}
                  className="w-32 h-auto border rounded"
                  alt="미리보기"
                />
              )}
              <Input
                placeholder="책 제목"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <Input
                placeholder="저자"
                value={form.author}
                onChange={(e) => setForm({ ...form, author: e.target.value })}
              />
              <Textarea
                placeholder="간략한 설명"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              <Input
                placeholder="추천자 (학번 이름)"
                value={form.recommender}
                onChange={(e) =>
                  setForm({ ...form, recommender: e.target.value })
                }
              />
              <Button
                onClick={handleAddBook}
                className="bg-[#a47551] hover:bg-[#8b5a3e] text-white"
              >
                추가하기
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 책장 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {books.map((book) => (
          <Dialog key={book.id}>
            <DialogTrigger asChild>
              <Card className="cursor-pointer bg-[#fff9f0] shadow-lg rounded-xl hover:scale-[1.03] transition-transform border border-[#e0d4c0] scale-[0.75]">
                <img
                  src={book.image}
                  alt={book.title}
                  className="rounded-t-xl w-full object-cover aspect-[2/3]"
                />
                <CardContent className="p-2 text-center text-sm text-[#5e4630] font-semibold truncate">
                  {book.title}
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-white border-none rounded-xl shadow-2xl p-6">
              <h2 className="text-2xl font-bold text-[#5e4630] mb-2">
                {book.title}
              </h2>
              <p className="text-[#6e5e4a]">
                <strong>저자:</strong> {book.author}
              </p>
              <p className="text-[#6e5e4a]">
                <strong>설명:</strong> {book.description}
              </p>
              <p className="text-[#6e5e4a] mb-4">
                <strong>추천자:</strong> {book.recommender}
              </p>

              <Button
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  setBooks(prev => prev.filter(b => b.id !== book.id));
                }}
              >
                🗑️ 이 책 삭제하기
              </Button>
            </DialogContent>

          </Dialog>
        ))}
      </div>
    </div>
  );
}
