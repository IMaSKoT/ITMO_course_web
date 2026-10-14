package ru.itmo.dormitory.dto;

import java.util.List;

public class PageResponse<T> {

    public List<T> items;
    public int page;
    public int size;
    public long totalItems;
    public int totalPages;

    public PageResponse(List<T> items, int page, int size, long totalItems) {
        this.items = items;
        this.page = page;
        this.size = size;
        this.totalItems = totalItems;
        this.totalPages = (int) ((totalItems + size - 1) / size);
    }
}
