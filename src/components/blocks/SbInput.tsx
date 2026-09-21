import { storyblokEditable } from '@storyblok/react/rsc';
import type { SbBlokData } from '@storyblok/react/rsc';
import { Input } from '@/components/ui/Input';

export interface SbInputBlok extends SbBlokData {
  component: 'input';
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url';
  placeholder?: string;
  required?: boolean;
  errorMessage?: string;
}

interface SbInputProps {
  blok: SbInputBlok;
}

const SbInput = ({ blok }: SbInputProps) => {
  return (
    <div {...storyblokEditable(blok)} className="w-full">
      <Input
        id={blok._uid}
        label={blok.label}
        type={blok.type || 'text'}
        placeholder={blok.placeholder || ''}
        required={blok.required || false}
        error={blok.errorMessage}
      />
    </div>
  );
};

export default SbInput;
