/*
 * ColdRuby -- V8-based Ruby implementation.
 * Copyright (C) 2011  Sergey Gridassov <grindars@gmail.com>
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 */

#include "ColdRubyExtension.h"
#include "LoadedExtension.h"

using namespace coldruby;

LoadedExtension::LoadedExtension(const std::string &file, const DynamicLibrary &library, ColdRubyExtension *extension) :
	m_file(file), m_library(library), m_extension(extension) {

}

LoadedExtension::~LoadedExtension() {
	delete m_extension;
}

std::string LoadedExtension::file() const {
	return m_file;
}

DynamicLibrary LoadedExtension::library() const {
	return m_library;
}

ColdRubyExtension *LoadedExtension::extension() const {
	return m_extension;
}

