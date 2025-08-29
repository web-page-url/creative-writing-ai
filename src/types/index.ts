export interface Suggestion {
  category: 'grammar' | 'spelling' | 'punctuation' | 'style' | 'clarity';
  issue: string;
  suggestion: string;
  explanation: string;
  position: number;
}

export interface Category {
  id: string;
  label: string;
  color: string;
}

export interface Font {
  value: string;
  label: string;
}

export interface TextSize {
  value: string;
  label: string;
}

export interface LineSpacing {
  value: string;
  label: string;
}

export interface TooltipPosition {
  top: number;
  left: number;
  isBelow: boolean;
}

export interface FormattingState {
  fontFamily: string;
  fontSize: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  lineHeight: string;
}